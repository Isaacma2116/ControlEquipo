const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const Usuario = require('../models/Usuario'); // Asegúrate de que este modelo esté correctamente configurado
const db = require('../config/database'); // Solo si necesitas el objeto de base de datos para otras consultas

// Registro de usuarios
exports.register = async (req, res) => {
    const { username, email, password, role } = req.body;
    try {
        // Verifica si el usuario o email ya existen
        const existingUser = await Usuario.findOne({
            where: {
                [Op.or]: [{ username }, { email }]
            }
        });

        if (existingUser) {
            return res.status(400).json({ success: false, message: 'El username o email ya están en uso.' });
        }

        // Hash de la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Inserta el nuevo usuario en la base de datos
        await Usuario.create({ username, email, password: hashedPassword, role });

        return res.status(201).json({ success: true, message: 'Usuario registrado con éxito.' });
    } catch (error) {
        console.error('Error en el registro:', error);
        return res.status(500).json({ success: false, message: 'Error al registrar el usuario.' });
    }
};

// Inicio de sesión
exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        // Busca al usuario por email o nombre de usuario
        const user = await Usuario.findOne({
            where: {
                [Op.or]: [{ email }, { username: email }]
            }
        });

        if (!user) {
            return res.status(400).json({ success: false, message: 'Usuario no encontrado.' });
        }

        // Verifica la contraseña
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ success: false, message: 'Contraseña incorrecta.' });
        }

        // Verifica que el rol no sea null
        if (!user.role) {
            return res.status(400).json({ success: false, message: 'El rol del usuario no está definido.' });
        }

        // Crea y asigna un token JWT
        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET);
        return res.json({ success: true, token: token, role: user.role, message: 'Inicio de sesión exitoso.' });
    } catch (error) {
        console.error('Error en el inicio de sesión:', error);
        return res.status(500).json({ success: false, message: 'Error al iniciar sesión.' });
    }
};

