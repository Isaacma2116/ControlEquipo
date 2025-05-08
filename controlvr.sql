-- MySQL dump 10.13  Distrib 8.0.32, for Win64 (x86_64)
--
-- Host: localhost    Database: control
-- ------------------------------------------------------
-- Server version	8.0.32

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `auxiliares`
--

DROP TABLE IF EXISTS `auxiliares`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auxiliares` (
  `id_auxiliar` int NOT NULL AUTO_INCREMENT,
  `id_equipo` varchar(50) DEFAULT NULL,
  `nombre_auxiliar` varchar(100) NOT NULL,
  `numero_serie_aux` varchar(100) DEFAULT NULL,
  `estadoActivo` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id_auxiliar`),
  KEY `id_equipo` (`id_equipo`),
  CONSTRAINT `auxiliares_ibfk_1` FOREIGN KEY (`id_equipo`) REFERENCES `equipos` (`id_equipos`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=135 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `auxiliares_historial`
--

DROP TABLE IF EXISTS `auxiliares_historial`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auxiliares_historial` (
  `id_historial` int NOT NULL AUTO_INCREMENT,
  `id_auxiliar` int DEFAULT NULL,
  `id_equipo` varchar(50) DEFAULT NULL,
  `nombre_auxiliar` varchar(100) DEFAULT NULL,
  `numero_serie_aux` varchar(100) DEFAULT NULL,
  `operacion` varchar(50) DEFAULT NULL,
  `fecha_operacion` datetime DEFAULT NULL,
  PRIMARY KEY (`id_historial`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `auxiliarhistorials`
--

DROP TABLE IF EXISTS `auxiliarhistorials`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auxiliarhistorials` (
  `id_auxiliar_historial` int NOT NULL AUTO_INCREMENT,
  `id_auxiliar` int NOT NULL,
  `nombre_auxiliar` varchar(255) DEFAULT NULL,
  `numero_serie_aux` varchar(255) DEFAULT NULL,
  `id_equipo` varchar(255) DEFAULT NULL,
  `operacion` varchar(255) NOT NULL,
  `fecha_operacion` datetime NOT NULL,
  PRIMARY KEY (`id_auxiliar_historial`)
) ENGINE=InnoDB AUTO_INCREMENT=71 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `celulares`
--

DROP TABLE IF EXISTS `celulares`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `celulares` (
  `idmovil` int NOT NULL AUTO_INCREMENT,
  `Color` varchar(50) DEFAULT NULL,
  `Marca` varchar(100) DEFAULT NULL,
  `Modelo` varchar(100) DEFAULT NULL,
  `IMEI` varchar(100) DEFAULT NULL,
  `Contrasena_o_Pin` varchar(100) DEFAULT NULL,
  `CorreoAsociado` varchar(100) DEFAULT NULL,
  `ComponentesDelCelular` text,
  `RenovacionDelEquipo` date DEFAULT NULL,
  `idColaborador` int DEFAULT NULL,
  `contrasenaDelCorreo` varchar(100) DEFAULT NULL,
  `numeroDeSerie` varchar(255) NOT NULL,
  PRIMARY KEY (`idmovil`),
  KEY `ID_del_propietario` (`idColaborador`),
  CONSTRAINT `celulares_ibfk_1` FOREIGN KEY (`idColaborador`) REFERENCES `colaboradores` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `colaboradores`
--

DROP TABLE IF EXISTS `colaboradores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `colaboradores` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_empleado` varchar(255) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `area` varchar(255) DEFAULT NULL,
  `cargo` varchar(255) DEFAULT NULL,
  `correo` varchar(255) NOT NULL,
  `telefono_personal` varchar(255) DEFAULT NULL,
  `correo_smex` varchar(255) DEFAULT NULL,
  `fotografia` varchar(255) DEFAULT NULL,
  `telefono_smex` varchar(255) DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `equipos`
--

DROP TABLE IF EXISTS `equipos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `equipos` (
  `id_equipos` varchar(255) NOT NULL,
  `tipoDispositivo` varchar(255) NOT NULL,
  `marca` varchar(255) DEFAULT NULL,
  `modelo` varchar(255) DEFAULT NULL,
  `numeroSerie` varchar(255) NOT NULL,
  `contrasenaEquipo` varchar(255) DEFAULT NULL,
  `ram` varchar(255) DEFAULT NULL,
  `discoDuro` varchar(255) DEFAULT NULL,
  `tarjetaMadre` varchar(255) DEFAULT NULL,
  `tarjetaGrafica` varchar(255) DEFAULT NULL,
  `procesador` varchar(255) DEFAULT NULL,
  `componentesAdicionales` json DEFAULT NULL,
  `estadoFisico` varchar(255) DEFAULT NULL,
  `detallesIncidentes` text,
  `garantia` varchar(255) DEFAULT NULL,
  `fechaCompra` date DEFAULT NULL,
  `activo` varchar(255) DEFAULT NULL,
  `sistemaOperativo` varchar(255) DEFAULT NULL,
  `mac` varchar(255) DEFAULT NULL,
  `hostname` varchar(255) DEFAULT NULL,
  `idColaborador` int DEFAULT NULL,
  `imagen` varchar(255) DEFAULT NULL,
  `estadoActivo` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id_equipos`),
  UNIQUE KEY `id_equipos` (`id_equipos`),
  KEY `idColaborador` (`idColaborador`),
  CONSTRAINT `equipos_ibfk_1` FOREIGN KEY (`idColaborador`) REFERENCES `colaboradores` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `equipos_historial`
--

DROP TABLE IF EXISTS `equipos_historial`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `equipos_historial` (
  `id_historial` int NOT NULL AUTO_INCREMENT,
  `id_equipos` varchar(255) DEFAULT NULL,
  `tipoDispositivo` varchar(255) DEFAULT NULL,
  `marca` varchar(255) DEFAULT NULL,
  `modelo` varchar(255) DEFAULT NULL,
  `numeroSerie` varchar(255) DEFAULT NULL,
  `contrasenaEquipo` varchar(255) DEFAULT NULL,
  `ram` varchar(255) DEFAULT NULL,
  `discoDuro` varchar(255) DEFAULT NULL,
  `tarjetaMadre` varchar(255) DEFAULT NULL,
  `tarjetaGrafica` varchar(255) DEFAULT NULL,
  `procesador` varchar(255) DEFAULT NULL,
  `componentesAdicionales` json DEFAULT NULL,
  `estadoFisico` varchar(255) DEFAULT NULL,
  `detallesIncidentes` text,
  `garantia` varchar(255) DEFAULT NULL,
  `fechaCompra` date DEFAULT NULL,
  `activo` varchar(255) DEFAULT NULL,
  `sistemaOperativo` varchar(255) DEFAULT NULL,
  `mac` varchar(255) DEFAULT NULL,
  `hostname` varchar(255) DEFAULT NULL,
  `idColaborador` int DEFAULT NULL,
  `imagen` longblob,
  `operacion` varchar(50) DEFAULT NULL,
  `fecha_operacion` datetime DEFAULT NULL,
  PRIMARY KEY (`id_historial`)
) ENGINE=InnoDB AUTO_INCREMENT=83 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `software`
--

DROP TABLE IF EXISTS `software`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `software` (
  `id_software` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) NOT NULL,
  `version` varchar(255) DEFAULT NULL,
  `fecha_adquisicion` date DEFAULT NULL,
  `fecha_caducidad` date DEFAULT NULL,
  `tipoLicencia` enum('mensual','anual','vitalicia') DEFAULT NULL,
  `estado` enum('activo','sin uso','vencido','vencido con equipo') DEFAULT NULL,
  `estadoActivo` tinyint(1) NOT NULL DEFAULT '1',
  `licenciaCaducada` tinyint(1) DEFAULT NULL,
  `maxDispositivos` int DEFAULT NULL,
  PRIMARY KEY (`id_software`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `software_equipos`
--

DROP TABLE IF EXISTS `software_equipos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `software_equipos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_software` int NOT NULL,
  `id_equipos` varchar(255) NOT NULL,
  `id_licencia` int DEFAULT NULL,
  `fechaAsignacion` datetime DEFAULT NULL,
  `estado_asignacion` enum('activo','inactivo') NOT NULL DEFAULT 'activo',
  PRIMARY KEY (`id`),
  KEY `id_software` (`id_software`),
  KEY `id_licencia` (`id_licencia`),
  CONSTRAINT `software_equipos_ibfk_1` FOREIGN KEY (`id_software`) REFERENCES `software` (`id_software`) ON DELETE CASCADE,
  CONSTRAINT `software_equipos_ibfk_2` FOREIGN KEY (`id_licencia`) REFERENCES `software_licencias` (`id_licencia`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=77 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `software_equipos_historial`
--

DROP TABLE IF EXISTS `software_equipos_historial`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `software_equipos_historial` (
  `id_historial` int NOT NULL AUTO_INCREMENT,
  `id_software_equipo` int NOT NULL,
  `id_software` int NOT NULL,
  `id_equipos` varchar(255) NOT NULL,
  `id_licencia` int DEFAULT NULL,
  `fechaAsignacion` date NOT NULL,
  `estado_asignacion` enum('activo','inactivo') NOT NULL,
  `fecha_operacion` timestamp NOT NULL,
  `accion` enum('insertar','editar','borrar') NOT NULL,
  PRIMARY KEY (`id_historial`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `software_historial`
--

DROP TABLE IF EXISTS `software_historial`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `software_historial` (
  `id_historial` int NOT NULL AUTO_INCREMENT,
  `id_software` int NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `version` varchar(255) NOT NULL,
  `fecha_adquisicion` date DEFAULT NULL,
  `fecha_caducidad` date DEFAULT NULL,
  `tipoLicencia` enum('mensual','anual','vitalicia') NOT NULL,
  `estado` enum('activo','sin uso','vencido','vencido con equipo','inactivo') NOT NULL,
  `licenciaCaducada` tinyint(1) NOT NULL DEFAULT '0',
  `maxDispositivos` int NOT NULL,
  `estadoActivo` tinyint NOT NULL DEFAULT '1',
  `fecha_operacion` timestamp NOT NULL,
  `accion` enum('insertar','editar','borrar') NOT NULL,
  PRIMARY KEY (`id_historial`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `software_licencias`
--

DROP TABLE IF EXISTS `software_licencias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `software_licencias` (
  `id_licencia` int NOT NULL AUTO_INCREMENT,
  `id_software` int NOT NULL,
  `claveLicencia` varchar(255) DEFAULT NULL,
  `correoAsociado` varchar(255) DEFAULT NULL,
  `contrasenaCorreo` varchar(255) DEFAULT NULL,
  `compartida` tinyint(1) DEFAULT NULL,
  `estado_renovacion` enum('activa','caducada') DEFAULT NULL,
  PRIMARY KEY (`id_licencia`),
  KEY `id_software` (`id_software`),
  CONSTRAINT `software_licencias_ibfk_1` FOREIGN KEY (`id_software`) REFERENCES `software` (`id_software`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=67 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `software_licencias_historial`
--

DROP TABLE IF EXISTS `software_licencias_historial`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `software_licencias_historial` (
  `id_historial` int NOT NULL AUTO_INCREMENT,
  `id_licencia_original` int NOT NULL,
  `id_software` int NOT NULL,
  `claveLicencia` varchar(255) NOT NULL,
  `correoAsociado` varchar(255) DEFAULT NULL,
  `contrasenaCorreo` varchar(255) DEFAULT NULL,
  `compartida` tinyint(1) NOT NULL DEFAULT '0',
  `estado_renovacion` enum('activa','caducada') NOT NULL,
  `fecha_operacion` timestamp NOT NULL,
  `accion` enum('insertar','editar','borrar') NOT NULL,
  PRIMARY KEY (`id_historial`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(255) DEFAULT 'user',
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `username_2` (`username`),
  UNIQUE KEY `email_2` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-12-30 12:16:47
