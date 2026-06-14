-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: localhost    Database: test1
-- ------------------------------------------------------
-- Server version	8.0.44

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
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `username` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `hotel_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKr43af9ap4edm43mmtq01oddj6` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (2,'$2a$10$avIJj7pos9YurekDHFX5JONYh2jaRApd1vbbkpKBc7nLilY.a/dEu','admin',NULL,NULL),(3,'$2a$10$s7//UJ.OHdyfpmDMG0hrTuGaNmD7hxKKdGZ/yQXxeATjbwXJZ2Hci','123',NULL,2),(4,'$2b$10$bFiEIdsB44dDyzHbd/E/XuPEPY6l.KlVhw9vMii5U/Qbj6UZcLY.y','anna',NULL,7),(5,'$2b$10$5M7x8bSbWsGZ8b5Z5Jh6VuQU6HpIWvLfMPXxVLG/4bO5vRoem2nGW','1234',NULL,3),(6,'$2b$10$Jxy2G9lCkWB84QwY7wbzXOJ4Xrh6wwlBLvCAT3of4WN4H.FBAjnKC','adamivanov','adamivanov@gmail.com',6),(7,'$2b$10$54NqCG2UdHIe14eShEGA5eBvJ5IjO5J7QtD1zL2Fap2eH/zfqkVdu','54321','123456@GMAIL.COM',NULL),(8,'$2b$10$so.gH9gDx3co6IIykpT8UuLiqfmAoVmWDdlGXw5VimaxlnUA9aMsS','andria','andria@gmail.com',NULL),(9,'$2b$10$VhbR320UC6OYDIeC/7wpFuR7iBsTOoO7nCFygnZ5CDkwkq0ZamuKm','asdf','asdf@gmail.com',5),(10,'$2b$10$E9XFXTn3MqUJ.vTJ45An9e41JP2VpPHZB5W.4XKlTH/ggFBoU7Ht2','fast','fast@gmail.com',NULL),(11,'$2b$10$oTxLf63HfGtVijIyOFLIl.Sg6/o55WhPlci2nCq.DgXtcb.KkB18O','gorg','gorg@gmai.com',NULL),(12,'$2b$10$p/7jfPkBh2RnCpKk1E0.r.Tf/2kwLY1sRMTlxenyfWhTYsu8bIIo6','frist','frist@gfgfgfg',NULL),(13,'$2b$10$O7c3SkjvR9OedUWaMtQe3OHIAq42MlcIlBr6jOSxWd1CAJ5XfvT0C','fred','fred@gmail.com',NULL),(14,'$2b$10$X4ZqcpCbPAUYn47FAPBn5OWrdjvKGUId3cGGnuT/B0DWFPMrDfns2','egorr','egorr@gmail.com',NULL),(15,'$2b$10$JncNe.qeZnRQ/3W/yghPMudKspX6rR/.cxE3EktEaB95ad2lmoJ.K','54312','fdfdff@altiora.net',NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-06-10 18:17:33
