import matplotlib.pyplot as plt
import matplotlib.patches as patches
import os

def create_flowchart():
    # 1. Canvas Setup
    fig, ax = plt.subplots(figsize=(15, 21), dpi=300)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 105)
    ax.axis('off')

    # Color Palette
    bg_card = "#FFFFFF"
    text_dark = "#1E293B"
    text_muted = "#475569"
    border_col = "#CBD5E1"
    
    # ── Header Banner ────────────────────────────────────────────────────────
    banner = patches.FancyBboxPatch((4, 95), 92, 8, boxstyle="round,pad=0.8,rounding_size=1.5",
                                    facecolor="#0F172A", edgecolor="#0284C7", linewidth=2.5)
    ax.add_patch(banner)
    ax.text(50, 99.8, "KR FUELS - LOW FUEL STOCK-TO-DISPATCH PIPELINE", 
            fontsize=18, fontweight='bold', color="#FFFFFF", ha='center', va='center')
    ax.text(50, 96.8, "Automated Workflow: From Tank Gauge Sensor Ingestion to Highway Tanker Replenishment", 
            fontsize=11.5, color="#38BDF8", ha='center', va='center')

    # Helper function to draw rounded box
    def draw_step_box(x, y, w, h, step_num, title, badge, lines, border_color, badge_color="#0F172A", bg_color=bg_card):
        # Card shadow
        shadow = patches.FancyBboxPatch((x+0.5, y-0.6), w, h, boxstyle="round,pad=0.5,rounding_size=1.2",
                                        facecolor="#E2E8F0", edgecolor="none", zorder=1)
        ax.add_patch(shadow)
        # Card main body
        box = patches.FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.5,rounding_size=1.2",
                                     facecolor=bg_color, edgecolor=border_color, linewidth=2.2, zorder=2)
        ax.add_patch(box)
        
        # Step Circle & Title
        ax.text(x + 2.5, y + h - 1.8, step_num, fontsize=12, fontweight='bold', color="#FFFFFF",
                bbox=dict(boxstyle="circle,pad=0.35", facecolor=border_color, edgecolor="none"), zorder=3)
        ax.text(x + 6.8, y + h - 1.8, title, fontsize=13, fontweight='bold', color=text_dark, va='center', zorder=3)
        
        # Category Badge
        if badge:
            ax.text(x + w - 2.5, y + h - 1.8, f" {badge} ", fontsize=9, fontweight='bold', color="#FFFFFF",
                    bbox=dict(boxstyle="round,pad=0.3,rounding_size=0.4", facecolor=badge_color, edgecolor="none"),
                    ha='right', va='center', zorder=3)
            
        # Divider line
        ax.plot([x + 2, x + w - 2], [y + h - 3.2, y + h - 3.2], color="#E2E8F0", lw=1.2, zorder=3)
        
        # Bullet Lines
        line_y = y + h - 4.6
        for line in lines:
            ax.text(x + 3.2, line_y, line, fontsize=9.8, color=text_muted, va='center', zorder=3)
            line_y -= 1.4

    # ── Step 1: Depletion Ingestion ──────────────────────────────────────────
    draw_step_box(
        x=15, y=82.5, w=70, h=9.8,
        step_num="1",
        title="Fuel Depletion Signal Ingested",
        badge="IoT Telemetry / Manager Portal",
        lines=[
            "• Digital IoT ATG probes transmit JSON telemetry via POST /api/automation/iot/telemetry",
            "• Captures: Usable Stock (L), Dead Stock (L), Temperature (°C), Vapor Pressure (bar)",
            "• Fallback: Station Manager logs manual dipstick reading in Station Fuel Stock Portal"
        ],
        border_color="#0284C7", badge_color="#0284C7"
    )

    # Connecting Arrow 1 -> 2
    ax.annotate('', xy=(50, 78.5), xytext=(50, 82.5),
                arrowprops=dict(facecolor="#64748B", edgecolor="none", width=2.5, headwidth=9), zorder=4)

    # ── Step 2: Threshold Decision (Diamond style representation) ────────────
    # Main decision box
    draw_step_box(
        x=22, y=69.0, w=56, h=9.0,
        step_num="2",
        title="Automated Stock Threshold Evaluation",
        badge="Real-Time Rule Engine",
        lines=[
            "• Evaluates Condition: dead_stock_in_lt >= (60% × capacity_in_lt)",
            "• Checks if Usable Fuel is critically depleted below emergency buffer limit",
            "• Immediate branching: Normal Operational State vs Emergency Refill State"
        ],
        border_color="#D97706", badge_color="#D97706"
    )

    # Branch NO -> Green Box on the right
    ax.annotate('', xy=(82, 73.5), xytext=(78, 73.5),
                arrowprops=dict(facecolor="#16A34A", edgecolor="none", width=2.0, headwidth=7), zorder=4)
    ax.text(80, 74.5, "NO", fontsize=10, fontweight='bold', color="#16A34A", ha='center')

    # Side Box: Sufficient Fuel
    draw_step_box(
        x=82, y=69.2, w=15, h=8.6,
        step_num="OK",
        title="Normal",
        badge="sufficient_fuel='YES'",
        lines=[
            "• Stock above 40%",
            "• No truck dispatch",
            "• Continuous polling"
        ],
        border_color="#16A34A", badge_color="#16A34A", bg_color="#F0FDF4"
    )

    # Branch YES -> Arrow down to Step 3
    ax.annotate('', xy=(50, 65.0), xytext=(50, 69.0),
                arrowprops=dict(facecolor="#DC2626", edgecolor="none", width=2.5, headwidth=9), zorder=4)
    ax.text(52.5, 67.0, "YES (Depleted)", fontsize=10, fontweight='bold', color="#DC2626", va='center')

    # ── Step 3: State Transition & Audit Log ────────────────────────────────
    draw_step_box(
        x=15, y=55.2, w=70, h=9.8,
        step_num="3",
        title="Automated State Transition & Stockout Alert",
        badge="Audit Logging & MongoDB",
        lines=[
            "• Updates MongoDB station document: sets sufficient_fuel = 'NO'",
            "• Computes physical storage ullage limit: Available Ullage = Capacity - Current Stock",
            "• Enforces Refill Constraint: Needed Refill <= Available Ullage (prevents tank overfill)",
            "• Appends immutable event to stationChangeLog with actor: 'IoT ATG Sensor'"
        ],
        border_color="#DC2626", badge_color="#DC2626", bg_color="#FEF2F2"
    )

    # Connecting Arrow 3 -> 4
    ax.annotate('', xy=(50, 51.2), xytext=(50, 55.2),
                arrowprops=dict(facecolor="#64748B", edgecolor="none", width=2.5, headwidth=9), zorder=4)

    # ── Step 4: Landed-Cost Route Optimization ──────────────────────────────
    draw_step_box(
        x=15, y=41.4, w=70, h=9.8,
        step_num="4",
        title="Landed-Cost Multi-Terminal Route Optimization",
        badge="Cost Minimization Engine",
        lines=[
            "• Solves: min(Terminal_Purchase_Cost + RTKM_Transport_Freight + FASTag_Tolls)",
            "• Compares all candidate sources: CPCL (Manali), IOCL (Ennore), BPCL (Chennai)",
            "• Applies freight rate floor: max(Rs 1,750/MT, Rs 6.8 × MT × 2 × km) - eliminates 100km anomaly",
            "• Geographic clustering: groups adjacent stations within <= 80 km radius (max 2 stops/trip)"
        ],
        border_color="#4F46E5", badge_color="#4F46E5"
    )

    # Connecting Arrow 4 -> 5
    ax.annotate('', xy=(50, 37.4), xytext=(50, 41.4),
                arrowprops=dict(facecolor="#64748B", edgecolor="none", width=2.5, headwidth=9), zorder=4)

    # ── Step 5: Fleet Assignment & Hard Feasibility Checks ───────────────────
    draw_step_box(
        x=15, y=27.6, w=70, h=9.8,
        step_num="5",
        title="Tanker Fleet Allocation & Capacity Feasibility Check",
        badge="7MT & 12MT Fleet Solver",
        lines=[
            "• Evaluates 30 bullet tankers: 23x 12MT (21,720 L) and 7x 7MT (12,670 L)",
            "• Hard Constraint 1: sum(Delivered Liters) <= Tanker Carrying Capacity (Zero Overloading)",
            "• Hard Constraint 2: Station Delivery Quantity <= Physical Storage Ullage (Zero Overfill)",
            "• Exception Handling: If fleet exhausted, station logged in Unserved Report with explicit reason"
        ],
        border_color="#2563EB", badge_color="#2563EB"
    )

    # Connecting Arrow 5 -> 6
    ax.annotate('', xy=(50, 23.6), xytext=(50, 27.6),
                arrowprops=dict(facecolor="#64748B", edgecolor="none", width=2.5, headwidth=9), zorder=4)

    # ── Step 6: Driver Dispatch & Milestone Tracking ─────────────────────────
    draw_step_box(
        x=15, y=13.8, w=70, h=9.8,
        step_num="6",
        title="Dispatch Execution & Real-Time Driver Milestone Tracking",
        badge="Driver Portal & PDF Manifest",
        lines=[
            "• Generates official Printable PDF & CSV Dispatch Manifest for terminal security gate pass",
            "• Assigned driver accesses turn-by-turn itinerary on mobile Driver Portal",
            "• Driver confirms milestones: [1] Loaded at Source -> [2] In Transit -> [3] Arrived at Station",
            "• Microscopic traffic delays evaluated via BPR Link Congestion Model t = t0[1 + 0.15(V/C)^4]"
        ],
        border_color="#0F766E", badge_color="#0F766E"
    )

    # Connecting Arrow 6 -> 7
    ax.annotate('', xy=(50, 9.8), xytext=(50, 13.8),
                arrowprops=dict(facecolor="#64748B", edgecolor="none", width=2.5, headwidth=9), zorder=4)

    # ── Step 7: Replenishment & Cycle Closure ────────────────────────────────
    draw_step_box(
        x=15, y=1.2, w=70, h=8.6,
        step_num="7",
        title="Stock Replenishment & Closed-Loop Cycle Reset",
        badge="Automated Cycle Reset",
        lines=[
            "• Driver unloads fuel -> Station usable_lt credited in MongoDB database",
            "• Low-stock alert cleared: sufficient_fuel automatically set back to 'YES'",
            "• Tanker status returned to source terminal parking, ready for next optimal dispatch cycle"
        ],
        border_color="#15803D", badge_color="#15803D", bg_color="#F0FDF4"
    )

    # Save to both paths
    asset_dir = r"c:\Users\naren\Downloads\Ip-master (3)\Ip-master\frontend\assets"
    brain_dir = r"C:\Users\naren\.gemini\antigravity\brain\29ab6928-d705-4377-b15e-df4791322237"
    
    os.makedirs(asset_dir, exist_ok=True)
    os.makedirs(brain_dir, exist_ok=True)
    
    path1 = os.path.join(asset_dir, "low_fuel_workflow_flowchart.png")
    path2 = os.path.join(brain_dir, "low_fuel_workflow_flowchart.png")
    
    plt.tight_layout()
    plt.savefig(path1, bbox_inches='tight', dpi=300)
    plt.savefig(path2, bbox_inches='tight', dpi=300)
    plt.close()
    
    print(f"Flowchart image successfully created:\n  1. {path1}\n  2. {path2}")

if __name__ == "__main__":
    create_flowchart()
