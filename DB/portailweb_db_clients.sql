-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: localhost    Database: portailweb_db
-- ------------------------------------------------------
-- Server version	8.0.43

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
-- Table structure for table `clients`
--

DROP TABLE IF EXISTS `clients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `clients` (
  `id` int NOT NULL AUTO_INCREMENT,
  `num_telephone` varchar(20) DEFAULT NULL,
  `nom_complet` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `adresse` text,
  `forfait_internet` varchar(50) DEFAULT NULL,
  `date_creation` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `statut` varchar(50) DEFAULT 'Actif',
  PRIMARY KEY (`id`),
  UNIQUE KEY `num_telephone` (`num_telephone`)
) ENGINE=InnoDB AUTO_INCREMENT=97387471 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clients`
--

LOCK TABLES `clients` WRITE;
/*!40000 ALTER TABLE `clients` DISABLE KEYS */;
INSERT INTO `clients` VALUES (1,'22111333','Ahmed Ben Ali','ahmed@ooredoo.tn','Tunis, Avenue de Paris','ADSL 20 Mega','2026-03-28 11:28:31','Actif'),(2,'22999888','Sonia Mansour','sonia.m@ooredoo.tn','Sousse, Zone Touristique','Fibre Optique 50 Mega','2026-03-28 11:28:31','Resilier'),(21520277,'21520277','Elmi Mahrajen','e@gmail.com','Hay nagez','4G Box 25Go','2026-03-29 11:47:49','Resilier'),(22123456,'22123456','Hichem Test','test@ooredoo.tn','','ADSL One','2026-03-28 17:10:31','Resilier'),(24320120,'24320120','Raoudha Saidi','r@gmail.com','','ADSL One','2026-03-28 17:56:18','Resilier'),(26548840,'26548840','Ali Ali','a@gmail.com','Kram aeroport','4G Box 25Go','2026-03-29 12:29:48','Actif'),(28520277,'28520277','Otayel test','o@gmail.com','','ADSL One','2026-03-28 17:24:15','Resilier'),(28654789,'28654789','Mehrez Tbessi','m@gmail.com','Hay ennassim ','Fiber 100M','2026-03-29 11:46:33','Resilier'),(97387470,'97387470','Hichem Hammami','h@gmail.com','Ariana','4G Box 25Go','2026-03-29 12:50:50','Actif');
/*!40000 ALTER TABLE `clients` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-29 16:13:26
