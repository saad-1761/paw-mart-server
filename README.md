# PawMart - Server Side

This is the backend server for **PawMart**, a pet marketplace application. It handles all data operations for listings and orders, enabling users to upload, update, and manage their products.

**Live URL:** [PawMart Server]()

---

## Overview

- The server has **two main collections** in MongoDB:

  1. **`my-listings`** – stores all product/listing data uploaded by users.
  2. **`order`** – stores all order data for users.

- **CRUD Operations**:

  - **GET** – retrieves all listings or orders when products are displayed.
  - **POST/PUT** – adds new data or updates existing listings in the `my-listings` collection.
  - **DELETE** – removes listings or orders as needed.

- Whenever a user adds, updates, or deletes a product:
  - The corresponding entry in **`my-listings`** is updated or deleted.
  - Orders related to listings are handled in the **`order`** collection.

---

## Tech Stack

- Node.js
- Express.js
- MongoDB

---

## Features

- Simple and clear API for listing and order management.
- Users can manage their own products through the backend.
- Ensures data consistency between listings and orders.

---
