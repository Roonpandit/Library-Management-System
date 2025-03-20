import React, { useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import "./AddBook.css";

const ADD_BOOKS_ENDPOINT = import.meta.env.VITE_ADD_BOOKS_ENDPOINT;

const AddBook = () => {
  const navigate = useNavigate();
  const { accessToken } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    title: "",
    author: "",
    genre: "",
    publicationYear: "",
    description: "",
  });

  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!accessToken) {
      setError("Unauthorized! Please log in.");
      return;
    }

    try {
      await axios.post(ADD_BOOKS_ENDPOINT, formData, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      setSuccessMessage("✅ Book added successfully!");
      setTimeout(() => navigate("/admin"), 1500);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to add book.");
    }
  };

  return (
  <>
  <Navbar />
  <div className="add-book-container">
      
      <h2>Add a New Book</h2>
      {error && <p className="error">{error}</p>}
      {successMessage && <p className="success">{successMessage}</p>}

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Title"
          required
        />
        <input
          type="text"
          name="author"
          value={formData.author}
          onChange={handleChange}
          placeholder="Author"
          required
        />
        <input
          type="text"
          name="genre"
          value={formData.genre}
          onChange={handleChange}
          placeholder="Genre"
          required
        />
        <input
          type="number"
          name="publicationYear"
          value={formData.publicationYear}
          onChange={handleChange}
          placeholder="Year"
          required
        />
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Description"
          required
        />
        <button type="submit">Add Book</button>
      </form>
    </div>
  </>
    
  );
};

export default AddBook;
