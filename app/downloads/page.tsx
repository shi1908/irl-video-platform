"use client";

import { useEffect, useState } from "react";

type Download = {
  id: string;
  videoId: string;
  downloadedAt: string;
  ipAddress: string | null;
  device: string | null;
  browser: string | null;
  plan: string;
  status: string;
};

export default function DownloadsPage() {
  const [downloads, setDownloads] = useState<Download[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDownloads();
  }, []);

  async function loadDownloads() {
    try {
      const response = await fetch("/api/downloads/history");

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Could not load downloads.");
        return;
      }

      setDownloads(data.downloads || []);
    } catch (error) {
      console.error("DOWNLOAD PAGE ERROR:", error);
      setError("Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#080808",
        color: "#fff",
        padding: "40px 24px",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        {/* HEADER */}
        <div style={{ marginBottom: "35px" }}>
          <h1
            style={{
              margin: 0,
              fontSize: "40px",
              fontWeight: 800,
            }}
          >
            Downloads
          </h1>

          <p
            style={{
              marginTop: "8px",
              color: "#888",
            }}
          >
            Your downloaded videos and download history.
          </p>
        </div>

        {/* LOADING */}
        {loading && (
          <div
            style={{
              padding: "40px",
              background: "#111",
              border: "1px solid #222",
              borderRadius: "16px",
              textAlign: "center",
              color: "#999",
            }}
          >
            Loading downloads...
          </div>
        )}

        {/* ERROR */}
        {!loading && error && (
          <div
            style={{
              padding: "25px",
              background: "#151010",
              border: "1px solid #3a2020",
              borderRadius: "16px",
              color: "#ff7777",
            }}
          >
            {error}
          </div>
        )}

        {/* EMPTY */}
        {!loading && !error && downloads.length === 0 && (
          <div
            style={{
              padding: "60px 30px",
              background: "#111",
              border: "1px solid #222",
              borderRadius: "18px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: "45px",
                marginBottom: "15px",
              }}
            >
              ↓
            </div>

            <h2
              style={{
                margin: 0,
                fontSize: "22px",
              }}
            >
              No downloads yet
            </h2>

            <p
              style={{
                color: "#777",
                marginTop: "10px",
              }}
            >
              Videos you download will appear here.
            </p>
          </div>
        )}

        {/* DOWNLOADS */}
        {!loading && !error && downloads.length > 0 && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "15px",
            }}
          >
            {downloads.map((download) => (
              <div
                key={download.id}
                style={{
                  background: "#111",
                  border: "1px solid #222",
                  borderRadius: "16px",
                  padding: "22px",
                }}
              >
                {/* TOP */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "15px",
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <h3
                      style={{
                        margin: 0,
                        fontSize: "18px",
                      }}
                    >
                      Video: {download.videoId}
                    </h3>

                    <p
                      style={{
                        margin: "7px 0 0",
                        color: "#777",
                        fontSize: "14px",
                      }}
                    >
                      {new Date(
                        download.downloadedAt
                      ).toLocaleString()}
                    </p>
                  </div>

                  <span
                    style={{
                      background: "#1d1d1d",
                      border: "1px solid #333",
                      borderRadius: "20px",
                      padding: "6px 12px",
                      fontSize: "12px",
                      fontWeight: 700,
                      textTransform: "uppercase",
                    }}
                  >
                    {download.plan}
                  </span>
                </div>

                {/* DETAILS */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(160px, 1fr))",
                    gap: "20px",
                    marginTop: "22px",
                    paddingTop: "20px",
                    borderTop: "1px solid #222",
                  }}
                >
                  <Detail
                    title="Device"
                    value={download.device || "Unknown"}
                  />

                  <Detail
                    title="Browser"
                    value={download.browser || "Unknown"}
                  />

                  <Detail
                    title="IP Address"
                    value={download.ipAddress || "Unknown"}
                  />

                  <Detail
                    title="Status"
                    value={download.status}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function Detail({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div>
      <div
        style={{
          color: "#666",
          fontSize: "12px",
          marginBottom: "5px",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}
      >
        {title}
      </div>

      <div
        style={{
          color: "#ddd",
          fontSize: "14px",
        }}
      >
        {value}
      </div>
    </div>
  );
}