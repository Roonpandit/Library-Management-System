import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import "./UserDashboard.css";
import Navbars from "./Navbars";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const BOOKS_ENDPOINT = `${API_BASE_URL}/books`;
const FAVORITES_ENDPOINT = `${API_BASE_URL}/favorites`;

const UserDashboard = () => {
  const { accessToken } = useContext(AuthContext);
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ genre: "", author: "", year: "" });
  const [selectedBook, setSelectedBook] = useState(null);
  const [favorites, setFavorites] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const booksPerPage = 12;

  useEffect(() => {
    fetchBooks();
    if (accessToken) {
      fetchFavorites();
    }
  }, [accessToken]);

  useEffect(() => {
    if (selectedBook) {
      document.body.classList.add("popup-open");
    } else {
      document.body.classList.remove("popup-open");
    }

    return () => {
      document.body.classList.remove("popup-open");
    };
  }, [selectedBook]);

  const fetchBooks = async () => {
    try {
      const response = await axios.get(BOOKS_ENDPOINT);
      setBooks(response.data);
      setFilteredBooks(response.data);
    } catch (error) {
      console.error(
        "Error fetching books:",
        error.response?.data || error.message
      );
    }
  };

  const fetchFavorites = async () => {
    try {
      const response = await axios.get(FAVORITES_ENDPOINT, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setFavorites(response.data);
    } catch (error) {
      console.error(
        "Error fetching favorites:",
        error.response?.data || error.message
      );
    }
  };

  useEffect(() => {
    let filtered = books.filter((book) =>
      book.title.toLowerCase().includes(search.toLowerCase())
    );

    if (filters.genre) {
      filtered = filtered.filter(
        (book) => book.genre.toLowerCase() === filters.genre.toLowerCase()
      );
    }
    if (filters.author) {
      filtered = filtered.filter((book) =>
        book.author.toLowerCase().includes(filters.author.toLowerCase())
      );
    }
    if (filters.year) {
      filtered = filtered.filter(
        (book) => book.publicationYear.toString() === filters.year
      );
    }

    setFilteredBooks(filtered);
    setCurrentPage(1);
  }, [search, filters, books]);

  const totalPages = Math.ceil(filteredBooks.length / booksPerPage);
  const startIndex = (currentPage - 1) * booksPerPage;
  const currentBooks = filteredBooks.slice(
    startIndex,
    startIndex + booksPerPage
  );

  const toggleFavorite = async (book) => {
    if (!accessToken) {
      alert("Please log in to manage favorites.");
      return;
    }

    const isFav = favorites.some((fav) => fav._id === book._id);
    const url = `${FAVORITES_ENDPOINT}/${book._id}`;

    try {
      if (isFav) {
        await axios.delete(url, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        setFavorites(favorites.filter((fav) => fav._id !== book._id));
      } else {
        await axios.post(
          url,
          {},
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        setFavorites([...favorites, book]);
      }
    } catch (error) {
      console.error(
        "Error updating favorites:",
        error.response?.data || error.message
      );
    }
  };

  const handlePopupBackgroundClick = (e) => {
    if (e.target.classList.contains("popup-overlay")) {
      setSelectedBook(null);
    }
  };

  return (
    <>
      <Navbars />
      <div className="user-container">
        <h2>Library Books</h2>

        <div className="filters">
          <input
            type="text"
            placeholder="Search by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            onChange={(e) => setFilters({ ...filters, genre: e.target.value })}
          >
            <option value="">All Genres</option>
            {Array.from(new Set(books.map((book) => book.genre))).map(
              (genre) => (
                <option key={genre} value={genre}>
                  {genre}
                </option>
              )
            )}
          </select>
          <input
            type="text"
            placeholder="Filter by author..."
            value={filters.author}
            onChange={(e) => setFilters({ ...filters, author: e.target.value })}
          />
          <input
            type="number"
            placeholder="Filter by year..."
            value={filters.year}
            onChange={(e) => setFilters({ ...filters, year: e.target.value })}
          />
        </div>

        <div className="book-grid">
          {currentBooks.map((book) => (
            <div key={book._id} className="book-card">
              <h3>{book.title}</h3>
              <p>By {book.author}</p>

              <div className="btnns">
                <button onClick={() => setSelectedBook(book)}>
                  See Details
                </button>
                <div
                  className="heart-icon"
                  onClick={() => toggleFavorite(book)}
                  title={
                    favorites.some((fav) => fav._id === book._id)
                      ? "Remove from Fav"
                      : "Add to Fav"
                  }
                >
                  {favorites.some((fav) => fav._id === book._id) ? "❤️" : "🤍"}
                </div>
              </div>
            </div>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="pagination">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
            >
              Previous
            </button>
            <span>
              {" "}
              Page {currentPage} of {totalPages}{" "}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => prev + 1)}
            >
              Next
            </button>
          </div>
        )}

        {selectedBook && (
          <div className="popup-overlay" onClick={handlePopupBackgroundClick}>
            <div className="book-popup">
              <div className="popup-content">
                <h2>{selectedBook.title}</h2>
                <p>
                  <strong>Author:</strong> {selectedBook.author}
                </p>
                <p>
                  <strong>Publication Year:</strong>{" "}
                  {selectedBook.publicationYear}
                </p>
                <p>
                  <strong>Description:</strong> {selectedBook.description}
                </p>
                <button onClick={() => setSelectedBook(null)}>Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default UserDashboard;
