import React, { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import Navbar from "./Navbar";
import "./AdminDashboard.css";

const BOOKS_ENDPOINT = import.meta.env.VITE_API_BASE_URL + "/books";
const DELETE_BOOK_ENDPOINT = import.meta.env.VITE_API_BASE_URL + "/books/:id";
const ITEMS_PER_PAGE = 10; // ✅ Show 10 books per page

const AdminDashboard = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1); // ✅ Track current page
  const { accessToken } = useContext(AuthContext);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await axios.get(BOOKS_ENDPOINT);
      if (Array.isArray(response.data)) {
        setBooks(response.data);
      } else {
        console.error("❌ Unexpected API response:", response.data);
        setBooks([]);
      }
    } catch (error) {
      console.error("❌ Error fetching books:", error.response?.data || error.message);
      setError("Failed to load books. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /** Delete a book */
  const deleteBook = async (id) => {
    if (!accessToken) {
      alert("Unauthorized! Please log in.");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this book?")) return;

    try {
      const deleteUrl = DELETE_BOOK_ENDPOINT.replace(":id", id);
      await axios.delete(deleteUrl, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      setBooks((prevBooks) => prevBooks.filter((book) => book._id !== id));
      alert(`✅ Book deleted successfully!`);
    } catch (error) {
      console.error("❌ Error deleting book:", error.response?.data || error.message);
      alert("Failed to delete book. Please try again.");
    }
  };

  /** Pagination logic */
  const totalPages = Math.ceil(books.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const displayedBooks = books.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <>
      <Navbar />
      <div className="admin-dashboard-container">
        <h2>Library Books</h2>

        {loading ? (
          <p>Loading books...</p>
        ) : error ? (
          <p className="error">{error}</p>
        ) : books.length === 0 ? (
          <p>No books available.</p>
        ) : (
          <>
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Genre</th>
                  <th>Year</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayedBooks.map((book) => (
                  <tr key={book._id}>
                    <td>{book.title}</td>
                    <td>{book.author}</td>
                    <td>{book.genre}</td>
                    <td>{book.publicationYear}</td>
                    <td>
                      <Link to={`/edit/${book._id}`}>
                        <button className="edit-btn">Edit</button>
                      </Link>
                      <button className="delete-btn" onClick={() => deleteBook(book._id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination Controls */}
            <div className="pagination">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage((prev) => prev - 1)}>
                Previous
              </button>
              <span> Page {currentPage} of {totalPages} </span>
              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage((prev) => prev + 1)}>
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default AdminDashboard;