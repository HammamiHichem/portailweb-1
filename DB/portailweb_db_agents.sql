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
-- Table structure for table `agents`
--

DROP TABLE IF EXISTS `agents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `agents` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('Agent','Admin') DEFAULT 'Agent',
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `agents`
--

LOCK TABLES `agents` WRITE;
/*!40000 ALTER TABLE `agents` DISABLE KEYS */;
INSERT INTO `agents` VALUES (1,'admin_ooredoo','$2b$10$0L4vf2ZHhpGELNkbX33Dw.mwwAntKFRspC59Ivp3TNtxRA19x6K6m','Agent'),(2,'Hichem Hammami','$2b$10$X11uE9Nt0xlyS2NzpYAvD.sn5ob35GrBcICPuAN.Q9xqvKIGHjxJO','Agent'),(3,'Mohamed','$2b$10$0KDD3XDFGI4X6UYWN6Ilme5liXgAX3XT7Ud1YuiiL75ICmuj9cik2','Agent'),(4,'ali','$2b$10$fhR9Ta6jVAO0HaGMZa2OxOBImM.RdxWzARXLy0reed5BFVhi.NTPC','Agent'),(5,'Hichem Test','$2b$10$cI5RSTSavFICpApcT5RtfejqhZUh4hKJYjyPBobpQBpMPiTRd8Gei','Agent'),(8,'Ooredoo@2026','$2b$10$7.i/bpPUMjMXvOO2Agl6tOV4XceCHqKKt3mf8Sy.GWid2A46lgYkK','Admin'),(9,'hichem tes','$2b$10$dTqd9PZUCGCLHTtvCelBxOgq44sH8DasPoA0bv19KxU0CEWzxSxaK','Agent'),(11,'kahlil test','$2b$10$X1xhHXW6EX2hHG7J/pW1A.yHV8/pkjWfDf8AN7wIoDL.KzJkZK5OO','Agent');
/*!40000 ALTER TABLE `agents` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-29 16:13:25
