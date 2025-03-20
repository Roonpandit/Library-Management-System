import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import "./Liked.css"; // Ensure styles are separate
import Navbars from "./Navbars";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const FAVORITES_ENDPOINT = `${API_BASE_URL}/favorites`;

const Liked = () => {
  const { accessToken } = useContext(AuthContext);
  const [favorites, setFavorites] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);

  useEffect(() => {
    if (accessToken) {
      fetchFavorites();
    }
  }, [accessToken]); // Fetch only when logged in

  /** Fetch user's favorite books */
  const fetchFavorites = async () => {
    try {
      const response = await axios.get(FAVORITES_ENDPOINT, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setFavorites(response.data); // API returns an array of favorite books
    } catch (error) {
      console.error("Error fetching favorites:", error.response?.data || error.message);
    }
  };

  /** Toggle favorite books */
  const toggleFavorite = async (book) => {
    const url = `${FAVORITES_ENDPOINT}/${book._id}`;
    try {
      await axios.delete(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setFavorites((prev) => prev.filter((fav) => fav._id !== book._id));
    } catch (error) {
      console.error("Error removing book:", error.response?.data || error.message);
    }
  };

  return (
    <>
    <Navbars />
    <div className="liked-container">
      <h2>Favorite Books</h2>

      {favorites.length === 0 ? (
        <p>No favorite books yet.</p>
      ) : (
        <div className="book-grid">
          {favorites.map((book) => (
            <div key={book._id} className="book-card">
              <h3>{book.title}</h3>
              <p>By {book.author}</p>

              <div className="btnns">
                <button onClick={() => setSelectedBook(book)}>See Details</button>
                <div className="heart-icon" onClick={() => toggleFavorite(book)} title="Remove from Favorites">
                  ❤️
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Book Details Popup */}
      {selectedBook && (
        <div className="book-popup">
          <div className="popup-content">
            <h2>{selectedBook.title}</h2>
            <p><strong>Author:</strong> {selectedBook.author}</p>
            <p><strong>Publication Year:</strong> {selectedBook.publicationYear}</p>
            <p><strong>Description:</strong> {selectedBook.description}</p>
            <button onClick={() => setSelectedBook(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
    
    </>
    
  );
};

export default Liked;