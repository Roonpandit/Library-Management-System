import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import "./EditBook.css";
import Navbar from "./Navbar";

const EDIT_BOOK_ENDPOINT = import.meta.env.VITE_EDIT_BOOK_ENDPOINT;
const UPDATE_BOOK_ENDPOINT = import.meta.env.VITE_UPDATE_BOOK_ENDPOINT;

const EditBook = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { accessToken } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    title: "",
    author: "",
    genre: "",
    publicationYear: "",
    description: "",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (accessToken) {
      fetchBook();
    }
  }, [accessToken]);

  const fetchBook = async () => {
    try {
      if (!accessToken) {
        setError("Unauthorized! Please log in.");
        return;
      }

      const bookUrl = EDIT_BOOK_ENDPOINT.replace(":id", id);
      const response = await axios.get(bookUrl, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      setFormData(response.data);
    } catch (error) {
      setError("Failed to load book details.");
      console.error(
        "Error fetching book:",
        error.response?.data || error.message
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!accessToken) {
        setError("Unauthorized! Please log in.");
        return;
      }

      const updateUrl = UPDATE_BOOK_ENDPOINT.replace(":id", id);
      await axios.put(updateUrl, formData, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      setSuccessMessage("Book updated successfully!");
      setTimeout(() => navigate("/admin"), 1500);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to update book.");
      console.error(
        "Error updating book:",
        error.response?.data || error.message
      );
    }
  };

  if (loading) return <p>Loading book details...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <>
      <Navbar />
      <div className="edit-book-container">
        <h2>Edit Book</h2>
        {successMessage && <p className="success">{successMessage}</p>}
        {error && <p className="error">{error}</p>}

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            placeholder="Title"
            required
          />
          <input
            type="text"
            name="author"
            value={formData.author}
            onChange={(e) =>
              setFormData({ ...formData, author: e.target.value })
            }
            placeholder="Author"
            required
          />
          <input
            type="text"
            name="genre"
            value={formData.genre}
            onChange={(e) =>
              setFormData({ ...formData, genre: e.target.value })
            }
            placeholder="Genre"
            required
          />
          <input
            type="number"
            name="publicationYear"
            value={formData.publicationYear}
            onChange={(e) =>
              setFormData({ ...formData, publicationYear: e.target.value })
            }
            placeholder="Year"
            required
          />
          <textarea
            name="description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="Description"
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Updating..." : "Update"}
          </button>
        </form>
      </div>
    </>
  );
};

export default EditBook;
