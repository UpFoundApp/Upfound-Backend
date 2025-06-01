# UpFound Backend API

A RESTful API backend for a product discovery and sharing platform similar to Product Hunt. This application allows users to register, login, submit products, upvote, and comment on products.

## Tech Stack

- **Node.js** & **Express.js**: Server framework  
- **MongoDB**: Database (via Mongoose ODM)  
- **JWT**: Authentication  
- **Cloudinary**: Image storage  
- **Multer**: File upload handling  
- **bcryptjs**: Password hashing  

## Features

### 🧑‍💼 User Management

- Registration and authentication  
- User profiles  
- View user's submissions and upvotes  

### 📦 Product Management

- Submit new products with logos and media  
- Browse products with filtering and sorting  
- Detailed product views  

### 💬 Social Features

- Upvote/downvote products  
- Comment on products  
- View user activity  

## API Endpoints

### Authentication

`POST /api/users/register`: Register a new user   
`POST /api/users/login`: Login and receive authentication token   

### User Routes

`GET /api/users/:id`: Get user profile by ID   
`GET /api/users/submissions`: Get products submitted by a user   
`GET /api/users/votes`: Get products upvoted by a user   

### Product  Routes

`GET /api/products`: Get all products (with filtering/sorting/pagination)   
`GET /api/products/:id`: Get product by ID   
`POST /api/products`: Submit a new product (authenticated)   
`PUT /api/products/:id/upvote`: Toggle upvote on a product (authenticated)   
`POST /api/products/:id/comment`: Add a comment to a product (authenticated)   
`GET /api/products/:id/comments`: Get comments for a product   


## Getting Started

### Prerequisites

- Node.js  
- MongoDB instance  
- Cloudinary account  

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/UpFoundApp/Upfound-Backend
   cd Upfound-Backend
   ```

2. **Install dependencies**
   ```bash
   npm install
    ```

3. **Create a `.env` file in the root directory with the following variables**
   ```bash
   MONGODB_URI=your_mongodb_connection_string
   PORT=3001
   JWT_SECRET=your_jwt_secret
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
    ```
4. **Start the server**
   ```bash
   npm run dev
   ```
