import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Importa useNavigate
import "./styles/Login.css"; // Importa el CSS

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const navigate = useNavigate(); // Usa useNavigate para la navegación

  // Validación de email y contraseña
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateEmail(email)) {
      setError("¡Formato de correo electrónico inválido!");
      return;
    }
    if (password.length < 8) {
      setError("¡La contraseña debe tener al menos 8 caracteres!");
      return;
    }

    setIsLoading(true);
    // Aquí puedes implementar la lógica de autenticación
    // Ejemplo de simulación de autenticación
    setTimeout(() => {
      setIsLoading(false);
      console.log("Inicio de sesión exitoso");
      navigate('/homes'); // Redirige a Homes después de iniciar sesión
    }, 2000);
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="logo-container">
          {/* Aquí puedes agregar tu logo */}
          <img src="/logo.png" alt="Logo" className="logo" />
        </div>
        <h2>Iniciar sesión</h2>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Correo electrónico</label>
            <div className="input-wrapper">
              <span className="input-icon">@</span>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Introduce tu correo electrónico"
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <div className="input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Introduce tu contraseña"
                required
              />
              <span
                className="input-icon"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "👁️" : "🔒"}
              </span>
            </div>
          </div>
          <div className="form-group">
            <div className="checkbox-container">
              <input
                type="checkbox"
                id="remember-me"
                name="remember-me"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label htmlFor="remember-me">Recuérdame</label>
            </div>
          </div>
          <button type="submit" className="login-button">
            {isLoading ? "Cargando..." : "Iniciar sesión"}
          </button>
        </form>
        <div className="links">
          <a href="/forgot-password">¿Olvidaste tu contraseña?</a>
          <a href="/signup">Crear una cuenta</a>
        </div>
      </div>
    </div>
  );
};

export default Login;
