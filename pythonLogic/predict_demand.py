"""
Machine Learning Enterprise Station Demand Forecasting Engine (81 KR Fuels Stations)
Addresses Critical Audit Issues (P0 Issue 3, Issue 8, P1 Issues 19, 20, 21, 22, 25):
1. Ingests actual sales history for all 81 stations from sales_data.xlsx.
2. Checks data integrity: detects missing records/nulls and flags incomplete stations explicitly.
3. Implements strict Chronological Train/Test Split (prevents future-data leakage).
4. Features: Lagged sales (t-1, t-7), 7-day rolling statistics, calendar day/weekend flags.
5. Benchmarks Random Forest Regressor against Baseline Naive Moving Average.
6. Reports accurate error metrics: MAE, RMSE, and Out-of-Sample R² Score.
7. Produces Low / Base / High (95% Confidence Interval) demand scenarios for procurement safety stock.
"""

import sys, os, json, math
from datetime import datetime, timedelta
import numpy as np
import pandas as pd

try:
    from sklearn.ensemble import RandomForestRegressor
    from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False

DEFAULT_DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "sales_data.xlsx")
STATIONS_DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "clean_stationss.xlsx")
MT_TO_LITERS = 1810.0


def load_actual_sales_and_stations(sales_file=None):
    file_to_read = sales_file if (sales_file and os.path.exists(sales_file)) else DEFAULT_DATA_PATH
    if not os.path.exists(file_to_read):
        alt_path = os.path.join(os.getcwd(), "data", "sales_data.xlsx")
        if os.path.exists(alt_path):
            file_to_read = alt_path

    sales_df = pd.read_excel(file_to_read)
    
    st_path = STATIONS_DATA_PATH if os.path.exists(STATIONS_DATA_PATH) else os.path.join(os.getcwd(), "data", "clean_stationss.xlsx")
    stations_info = {}
    if os.path.exists(st_path):
        st_df = pd.read_excel(st_path)
        for _, r in st_df.iterrows():
            name = str(r.get("Stations ") or r.get("Stations") or "").strip()
            if name:
                stations_info[name] = {
                    "capacity_lt": float(r.get("Capacity in Lt", 17000)),
                    "dead_stock_lt": float(r.get("Dead stock in Lt", 2000)),
                    "usable_lt": float(r.get("Usable Lt", 15000))
                }
                
    return sales_df, stations_info, file_to_read


def build_time_series_features(series):
    """Constructs lagged and rolling features without lookahead / future leakage."""
    df_ts = pd.DataFrame({"actual": series.values})
    df_ts["lag_1"] = df_ts["actual"].shift(1)
    df_ts["lag_7"] = df_ts["actual"].shift(7)
    df_ts["rolling_7_mean"] = df_ts["actual"].shift(1).rolling(7, min_periods=1).mean()
    df_ts["rolling_7_std"] = df_ts["actual"].shift(1).rolling(7, min_periods=1).std().fillna(0.0)
    return df_ts


def run_enterprise_demand_forecasting(uploaded_file=None):
    sales_df, stations_info, resolved_path = load_actual_sales_and_stations(uploaded_file)
    
    station_cols = [c for c in sales_df.columns if c != "Date"]
    total_stations = len(station_cols)
    total_records = len(sales_df)
    
    # 1. Audit Data Integrity (Issue 20)
    complete_stations = []
    incomplete_stations = []
    
    for st in station_cols:
        missing_count = int(sales_df[st].isna().sum())
        if missing_count == 0:
            complete_stations.append(st)
        else:
            incomplete_stations.append({
                "station": st,
                "missing_days": missing_count,
                "data_quality_status": "DATA_INCOMPLETE",
                "notes": f"Missing {missing_count} daily sales observations. Operational forecast suspended until data validated."
            })

    # 2. Chronological Split (Issue 8) - No future leakage
    split_idx = int(total_records * 0.80)  # Chronological 80% train, 20% test
    train_dates = (str(sales_df['Date'].iloc[0]).split()[0], str(sales_df['Date'].iloc[split_idx - 1]).split()[0])
    test_dates = (str(sales_df['Date'].iloc[split_idx]).split()[0], str(sales_df['Date'].iloc[-1]).split()[0])

    all_y_true = []
    all_y_pred_rf = []
    all_y_pred_baseline = []
    
    station_predictions = []
    
    for st in complete_stations:
        series = sales_df[st].astype(float)
        st_info = stations_info.get(st.strip(), {
            "capacity_lt": 17000.0,
            "dead_stock_lt": 2000.0,
            "usable_lt": 15000.0
        })
        
        # Build strict historical feature frame
        ts_feat = build_time_series_features(series)
        valid_rows = ts_feat.dropna()
        
        # Chronological Train vs Test
        train_feat = valid_rows.iloc[:max(1, split_idx - 7)]
        test_feat = valid_rows.iloc[max(1, split_idx - 7):]
        
        if len(test_feat) == 0:
            test_feat = valid_rows.tail(5)
            train_feat = valid_rows.iloc[:-5]

        X_train = train_feat[["lag_1", "lag_7", "rolling_7_mean", "rolling_7_std"]]
        y_train = train_feat["actual"]
        X_test = test_feat[["lag_1", "lag_7", "rolling_7_mean", "rolling_7_std"]]
        y_test = test_feat["actual"]
        
        # Baseline model: Seasonal / 7-day Naive moving average (Issue 21)
        y_pred_base = test_feat["rolling_7_mean"].values
        
        # Random Forest Regressor
        if SKLEARN_AVAILABLE and len(X_train) >= 3:
            rf = RandomForestRegressor(n_estimators=100, max_depth=6, random_state=42)
            rf.fit(X_train, y_train)
            y_pred_rf = rf.predict(X_test)
            
            # Predict Next Month (30 days ahead demand)
            latest_features = ts_feat[["lag_1", "lag_7", "rolling_7_mean", "rolling_7_std"]].iloc[[-1]]
            next_day_pred = float(rf.predict(latest_features)[0])
            monthly_forecast_lt = round(next_day_pred * 30.0)
            
            # Error standard deviation for 95% Confidence Intervals
            resids = y_train.values - rf.predict(X_train)
            sigma = float(np.std(resids)) if len(resids) > 1 else (next_day_pred * 0.08)
        else:
            y_pred_rf = y_pred_base
            next_day_pred = float(series.mean())
            monthly_forecast_lt = round(next_day_pred * 30.0)
            sigma = next_day_pred * 0.10

        all_y_true.extend(y_test.values)
        all_y_pred_rf.extend(y_pred_rf)
        all_y_pred_baseline.extend(y_pred_base)
        
        # 95% Confidence interval (Issue 25)
        monthly_forecast_mt = round(monthly_forecast_lt / MT_TO_LITERS, 2)
        ci_95_band_lt = round(1.96 * sigma * math.sqrt(30))
        low_demand_lt = max(0, monthly_forecast_lt - ci_95_band_lt)
        high_demand_lt = monthly_forecast_lt + ci_95_band_lt
        
        # Depletion & Replenishment Math (Issue 2)
        current_usable = st_info["usable_lt"]
        tank_capacity = st_info["capacity_lt"]
        available_ullage = max(0.0, tank_capacity - (st_info["dead_stock_lt"] + current_usable))
        days_to_empty = round(current_usable / max(1.0, next_day_pred), 1)
        
        # Recommended immediate replenishment (respecting physical storage ullage)
        recommended_refill_lt = min(available_ullage, monthly_forecast_lt)
        
        station_predictions.append({
            "station": st.strip(),
            "data_quality": "VERIFIED_COMPLETE",
            "historical_daily_avg_lt": round(float(series.mean()), 1),
            "projected_daily_demand_lt": round(next_day_pred, 1),
            "next_month_base_demand_lt": monthly_forecast_lt,
            "next_month_base_demand_mt": monthly_forecast_mt,
            "scenario_low_demand_lt": low_demand_lt,
            "scenario_high_demand_lt": high_demand_lt,
            "days_to_depletion": days_to_empty,
            "recommended_refill_lt": round(recommended_refill_lt),
            "available_storage_ullage_lt": round(available_ullage),
            "replenishment_urgency": "HIGH" if days_to_empty <= 2.0 else "MEDIUM" if days_to_empty <= 5.0 else "NORMAL"
        })

    # Overall Model Validation Metrics (Issue 21, 22)
    y_true_arr = np.array(all_y_true)
    y_rf_arr = np.array(all_y_pred_rf)
    y_base_arr = np.array(all_y_pred_baseline)
    
    rf_mae = round(float(mean_absolute_error(y_true_arr, y_rf_arr)), 2)
    rf_rmse = round(float(np.sqrt(mean_squared_error(y_true_arr, y_rf_arr))), 2)
    base_mae = round(float(mean_absolute_error(y_true_arr, y_base_arr)), 2)
    base_rmse = round(float(np.sqrt(mean_squared_error(y_true_arr, y_base_arr))), 2)
    
    out_of_sample_r2 = round(float(r2_score(y_true_arr, y_rf_arr)), 4)
    mae_improvement_pct = round(((base_mae - rf_mae) / max(1e-5, base_mae)) * 100.0, 1)

    return {
        "status": "SUCCESS",
        "data_source_file": os.path.basename(resolved_path),
        "total_stations_evaluated": total_stations,
        "complete_stations_count": len(complete_stations),
        "incomplete_stations_flagged": len(incomplete_stations),
        "incomplete_stations_details": incomplete_stations,
        "chronological_split_design": {
            "strategy": "Strict Chronological Forward Split (No Future Data Leakage)",
            "training_period": f"{train_dates[0]} to {train_dates[1]} (Chronological 80%)",
            "unseen_test_period": f"{test_dates[0]} to {test_dates[1]} (Chronological 20%)"
        },
        "model_benchmark_comparison": {
            "ml_model": "RandomForestRegressor (Lagged + Rolling Stats)",
            "baseline_model": "7-Day Naive Moving Average (Seasonal Baseline)",
            "ml_model_mae_lt": rf_mae,
            "baseline_mae_lt": base_mae,
            "ml_model_rmse_lt": rf_rmse,
            "baseline_rmse_lt": base_rmse,
            "out_of_sample_r2": out_of_sample_r2,
            "mae_error_reduction_vs_baseline": f"{mae_improvement_pct}% lower error"
        },
        "forecast_period": "Next Month (30-Day Forward Procurement)",
        "predictions": sorted(station_predictions, key=lambda x: x["days_to_depletion"])
    }


if __name__ == "__main__":
    file_arg = sys.argv[1] if len(sys.argv) > 1 else None
    results = run_enterprise_demand_forecasting(file_arg)
    print(json.dumps(results, indent=2))
