return (
  <div
    style={{
      minHeight: "100vh",
      padding: "2rem",
      fontFamily: "'Segoe UI', sans-serif",
      background: "linear-gradient(to bottom, #fdf6e3, #cce7e8)", // sand to sea
    }}
  >
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "1rem",
      }}
    >
      <h1
        style={{
          fontSize: "2rem",
          fontWeight: "bold",
          color: "#2a4d4f", // deep ocean
        }}
      >
        Your Desert Island Albums
      </h1>
      <button
        onClick={() => signOut()}
        style={{
          padding: "0.5rem 1rem",
          border: "none",
          borderRadius: "20px",
          background: "#e76f51", // coral red
          color: "white",
          cursor: "pointer",
        }}
      >
        Sign out
      </button>
    </div>

    {/* Saved albums */}
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
        gap: "1rem",
        marginTop: "1rem",
      }}
    >
      {albums.map((a) => (
        <div
          key={a.id}
          style={{
            border: "1px solid #ddd",
            borderRadius: "12px",
            padding: "0.5rem",
            background: "#fff",
            textAlign: "center",
            position: "relative",
            boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
            transition: "transform 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.03)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          {/* Delete cross */}
          <button
            onClick={() => deleteAlbum(a.id, a.album_name)}
            style={{
              position: "absolute",
              top: "6px",
              right: "6px",
              background: "transparent",
              border: "none",
              fontSize: "1.2rem",
              color: "#888",
              cursor: "pointer",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#e76f51")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#888")}
            title="Delete album"
          >
            ×
          </button>

          {a.album_image && (
            <img
              src={a.album_image}
              alt={a.album_name}
              style={{ width: "100%", borderRadius: "8px" }}
            />
          )}
          <p
            style={{
              fontWeight: "bold",
              margin: "0.5rem 0 0 0",
              color: "#2a4d4f",
            }}
          >
            {a.album_name}
          </p>
          <p style={{ margin: "0", fontSize: "0.9rem", color: "#555" }}>
            {a.artist_name}
          </p>
        </div>
      ))}
    </div>

    {/* Search */}
    {albums.length < 5 && (
      <div style={{ marginTop: "2rem" }} ref={searchRef}>
        <h2 style={{ color: "#2a4d4f" }}>Search Spotify Albums</h2>
        <input
          type="text"
          value={searchTerm}
          placeholder="Search albums..."
          onChange={(e) => {
            setSearchTerm(e.target.value);
            searchAlbums(e.target.value);
          }}
          style={{
            width: "100%",
            padding: "0.75rem",
            fontSize: "1rem",
            marginBottom: "0.5rem",
            borderRadius: "8px",
            border: "1px solid #bbb",
          }}
        />

        {dropdownOpen && searchResults.length > 0 && (
          <ul
            style={{
              border: "1px solid #ccc",
              borderRadius: "8px",
              listStyle: "none",
              padding: 0,
              margin: 0,
              maxHeight: "250px",
              overflowY: "auto",
              background: "#fff",
              position: "absolute",
              zIndex: 1000,
              width: "100%",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            {searchResults.map((album) => (
              <li
                key={album.id}
                onClick={() => addAlbum(album)}
                style={{
                  cursor: "pointer",
                  padding: "0.5rem",
                  borderBottom: "1px solid #eee",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                {album.images[0]?.url && (
                  <img src={album.images[0].url} alt={album.name} width={50} />
                )}
                <span>
                  {album.name} — {album.artists[0]?.name}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    )}
  </div>
);
