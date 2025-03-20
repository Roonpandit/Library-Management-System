import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import "./UserDashboard.css"; // Ensure you have a separate CSS file
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
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const booksPerPage = 12;  // Show 12 books per page

  useEffect(() => {
    fetchBooks();
    if (accessToken) {
      fetchFavorites();
    }
  }, [accessToken]); // Re-fetch when user logs in

  /** Fetch all books */
  const fetchBooks = async () => {
    try {
      const response = await axios.get(BOOKS_ENDPOINT);
      setBooks(response.data);
      setFilteredBooks(response.data);
    } catch (error) {
      console.error("Error fetching books:", error.response?.data || error.message);
    }
  };

  /** Fetch user's favorite books */
  const fetchFavorites = async () => {
    try {
      const response = await axios.get(FAVORITES_ENDPOINT, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setFavorites(response.data); // Assuming API returns an array of favorite books
    } catch (error) {
      console.error("Error fetching favorites:", error.response?.data || error.message);
    }
  };

  /** Update filters based on search input */
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
    setCurrentPage(1); // Reset to first page when filters change
  }, [search, filters, books]);

  /** Pagination Logic */
  const totalPages = Math.ceil(filteredBooks.length / booksPerPage);
  const startIndex = (currentPage - 1) * booksPerPage;
  const currentBooks = filteredBooks.slice(startIndex, startIndex + booksPerPage);

  /** Change Page */
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  /** Toggle favorite books */
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
      console.error("Error updating favorites:", error.response?.data || error.message);
    }
  };

  return (
    <>
      <Navbars />
      <div className="user-container">
        <h2>Library Books</h2>

        {/* Search and Filters */}
        <div className="filters">
          <input
            type="text"
            placeholder="Search by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select onChange={(e) => setFilters({ ...filters, genre: e.target.value })}>
            <option value="">All Genres</option>
            {Array.from(new Set(books.map((book) => book.genre))).map((genre) => (
              <option key={genre} value={genre}>
                {genre}
              </option>
            ))}
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

        {/* Book Cards */}
        <div className="book-grid">
          {currentBooks.map((book) => (
            <div key={book._id} className="book-card">
              <h3>{book.title}</h3>
              <p>By {book.author}</p>

              <div className="btnns">
                <button onClick={() => setSelectedBook(book)}>See Details</button>
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

{/* Pagination */}
{totalPages > 1 && (
  <div className="pagination">
    <button disabled={currentPage === 1} onClick={() => setCurrentPage((prev) => prev - 1)}>
      Previous
    </button>
    <span> Page {currentPage} of {totalPages} </span>
    <button disabled={currentPage === totalPages} onClick={() => setCurrentPage((prev) => prev + 1)}>
      Next
    </button>
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

export default UserDashboard;