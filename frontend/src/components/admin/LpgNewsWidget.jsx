import React, { useEffect, useState } from "react";
import { fetchLpgNewsFeed } from "../../services/api";

export const LpgNewsWidget = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadNews = async () => {
    setLoading(true);
    try {
      const res = await fetchLpgNewsFeed();
      setNews(res.data?.items || []);
    } catch (err) {
      console.error("Failed to load LPG news:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNews();
  }, []);

  return (
    <div className="card shadow-sm border-0 mb-4">
      <div className="card-header bg-dark text-white d-flex align-items-center justify-content-between">
        <h5 className="mb-0">📰 Live Auto LPG Industry & Terminal Market News Feed</h5>
        <button className="btn btn-outline-light btn-sm" onClick={loadNews} disabled={loading}>
          {loading ? "Refreshing..." : "🔄 Refresh News"}
        </button>
      </div>
      <div className="card-body p-0">
        {loading ? (
          <div className="p-3 text-center text-muted small">Fetching latest LPG market rates and news...</div>
        ) : !news.length ? (
          <div className="p-3 text-center text-muted small">No recent LPG news items available.</div>
        ) : (
          <div className="list-group list-group-flush" style={{ maxHeight: "280px", overflowY: "auto" }}>
            {news.map((item) => (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="list-group-item list-group-item-action p-3"
              >
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span className="badge bg-primary">{item.category || "Auto LPG Price"}</span>
                  <span className="text-muted small">
                    {item.published_at ? new Date(item.published_at).toLocaleDateString() : "Today"}
                  </span>
                </div>
                <h6 className="fw-bold mb-1 text-dark">{item.title}</h6>
                <p className="mb-0 text-muted small text-truncate">
                  {String(item.summary || item.source || "").replace(/<[^>]*>?/gm, "").trim()}
                </p>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
