import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import TransactionsList from "./pages/TransactionsList";
import Categories from "./pages/Categories";
import Chat from "./pages/Chat";

import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
	return (
		<Router>
			<Routes>
				{/* Public */}
				<Route path="/"         element={<Landing />} />
				<Route path="/login"    element={<Login />} />
				<Route path="/register" element={<Register />} />

				{/* Protected — wrapped in the minimalist Layout */}
				<Route
					path="/chat"
					element={
						<ProtectedRoute>
							<Layout><Chat /></Layout>
						</ProtectedRoute>
					}
				/>
				<Route
					path="/dashboard"
					element={
						<ProtectedRoute>
							<Layout><Dashboard /></Layout>
						</ProtectedRoute>
					}
				/>
				<Route
					path="/transactions"
					element={
						<ProtectedRoute>
							<Layout><TransactionsList /></Layout>
						</ProtectedRoute>
					}
				/>
				<Route
					path="/categories"
					element={
						<ProtectedRoute>
							<Layout><Categories /></Layout>
						</ProtectedRoute>
					}
				/>

				{/* Default → Chat if logged in, otherwise Landing via Navigate logic */}
				<Route path="*" element={<Navigate to="/chat" replace />} />
			</Routes>
		</Router>
	);
}

export default App;

