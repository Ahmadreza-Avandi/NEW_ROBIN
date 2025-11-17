-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 16, 2025 at 09:08 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `school`
--

DELIMITER $$
--
-- Procedures
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_class_attendance_by_date` (IN `p_classId` INT, IN `p_jalaliDate` VARCHAR(10))   BEGIN
    SELECT 
        u.id,
        u.fullName,
        u.nationalCode,
        COALESCE(a.status, 'absent') AS status,
        a.checkin_time,
        COUNT(DISTINCT a.subjectId) AS attendedSubjects,
        (SELECT COUNT(*) FROM subject WHERE classId = p_classId) AS totalSubjects
    FROM user u
    LEFT JOIN attendance a ON u.nationalCode = a.nationalCode 
        AND a.jalali_date = p_jalaliDate
    WHERE u.classId = p_classId AND u.roleId = 3
    GROUP BY u.id, u.fullName, u.nationalCode, a.status, a.checkin_time
    ORDER BY u.fullName;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_get_student_attendance` (IN `p_nationalCode` VARCHAR(10), IN `p_limit` INT)   BEGIN
    SELECT 
        a.id,
        a.jalali_date,
        a.gregorian_date,
        a.dayOfWeek,
        a.checkin_time,
        a.status,
        s.name AS subjectName,
        c.name AS className,
        a.location
    FROM attendance a
    LEFT JOIN subject s ON a.subjectId = s.id
    LEFT JOIN class c ON a.classId = c.id
    WHERE a.nationalCode = p_nationalCode
    ORDER BY a.gregorian_date DESC, a.checkin_time DESC
    LIMIT p_limit;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_get_teacher_subjects` (IN `p_teacherId` INT)   BEGIN
    SELECT 
        s.id,
        s.name AS subjectName,
        c.name AS className,
        s.dayOfWeek,
        s.startTime,
        s.endTime,
        COUNT(DISTINCT u.id) AS studentCount
    FROM subject s
    JOIN class c ON s.classId = c.id
    LEFT JOIN user u ON u.classId = c.id AND u.roleId = 3
    WHERE s.teacherId = p_teacherId
    GROUP BY s.id, s.name, c.name, s.dayOfWeek, s.startTime, s.endTime
    ORDER BY 
        FIELD(s.dayOfWeek, 'شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه'),
        s.startTime;
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `attendance`
--

CREATE TABLE `attendance` (
  `id` int(11) NOT NULL,
  `nationalCode` varchar(10) NOT NULL,
  `fullName` varchar(255) NOT NULL,
  `classId` int(11) DEFAULT NULL,
  `className` varchar(255) DEFAULT NULL,
  `jalali_date` varchar(10) NOT NULL,
  `gregorian_date` date NOT NULL,
  `checkin_time` varchar(8) NOT NULL,
  `location` varchar(255) NOT NULL,
  `dayOfWeek` varchar(20) DEFAULT NULL,
  `status` enum('present','absent') DEFAULT 'present',
  `subjectId` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- --------------------------------------------------------

--
-- Table structure for table `class`
--

CREATE TABLE `class` (
  `id` int(11) NOT NULL,
  `name` varchar(191) NOT NULL,
  `majorId` int(11) NOT NULL,
  `gradeId` int(11) NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `class`
--

INSERT INTO `class` (`id`, `name`, `majorId`, `gradeId`, `createdAt`, `updatedAt`) VALUES
(1, 'یازدهم شبکه و نرم‌افزار', 1, 1, '2025-11-14 15:54:03', '2025-11-14 15:54:03'),
(2, 'دوازدهم مکاترونیک', 2, 2, '2025-11-14 15:54:03', '2025-11-14 15:54:03'),
(3, 'دهم شبکه و نرم‌افزار', 1, 3, '2025-11-14 15:54:03', '2025-11-14 15:54:03'),
(4, 'دهم مکاترونیک', 2, 3, '2025-11-14 15:54:03', '2025-11-14 15:54:03'),
(5, 'یازدهم مکاترونیک', 2, 1, '2025-11-14 15:54:03', '2025-11-14 15:54:03'),
(6, 'دوازدهم ماشین ابزار', 3, 2, '2025-11-14 15:54:03', '2025-11-14 15:54:03'),
(7, 'دوازدهم شبکه و نرم افزار', 1, 2, '2025-11-14 16:31:50', '2025-11-14 16:31:50');

-- --------------------------------------------------------

--
-- Table structure for table `grade`
--

CREATE TABLE `grade` (
  `id` int(11) NOT NULL,
  `name` varchar(191) NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `grade`
--

INSERT INTO `grade` (`id`, `name`, `createdAt`, `updatedAt`) VALUES
(1, 'یازدهم', '2025-11-14 15:54:02', '2025-11-14 15:54:02'),
(2, 'دوازدهم', '2025-11-14 15:54:02', '2025-11-14 15:54:02'),
(3, 'دهم', '2025-11-14 15:54:02', '2025-11-14 15:54:02');

-- --------------------------------------------------------

--
-- Table structure for table `last_seen`
--

CREATE TABLE `last_seen` (
  `id` int(11) NOT NULL,
  `fullName` varchar(191) NOT NULL,
  `nationalCode` varchar(191) NOT NULL,
  `checkin_time` datetime(3) NOT NULL,
  `location` varchar(191) DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `location`
--

CREATE TABLE `location` (
  `id` int(11) NOT NULL,
  `title` varchar(191) NOT NULL,
  `representative` varchar(191) NOT NULL,
  `grade` varchar(191) NOT NULL,
  `major` varchar(191) NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `major`
--

CREATE TABLE `major` (
  `id` int(11) NOT NULL,
  `name` varchar(191) NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `major`
--

INSERT INTO `major` (`id`, `name`, `createdAt`, `updatedAt`) VALUES
(1, 'شبکه و نرم‌افزار', '2025-11-14 15:54:03', '2025-11-14 15:54:03'),
(2, 'مکاترونیک', '2025-11-14 15:54:03', '2025-11-14 15:54:03'),
(3, 'ماشین ابزار', '2025-11-14 15:54:03', '2025-11-14 15:54:03');

-- --------------------------------------------------------

--
-- Table structure for table `role`
--

CREATE TABLE `role` (
  `id` int(11) NOT NULL,
  `name` varchar(191) NOT NULL,
  `permissions` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`permissions`)),
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `role`
--

INSERT INTO `role` (`id`, `name`, `permissions`, `createdAt`, `updatedAt`) VALUES
(1, 'مدیر', '{\"viewPlaces\": true, \"editPlaces\": true, \"deletePlaces\": true, \"viewPersons\": true, \"editPersons\": true, \"deletePersons\": true, \"viewRoles\": true, \"editRoles\": true, \"deleteRoles\": true}', '2025-11-14 15:54:02', '2025-11-14 15:54:02'),
(2, 'معلم', '{\"viewPlaces\": true, \"editPlaces\": false, \"deletePlaces\": false, \"viewPersons\": true, \"editPersons\": false, \"deletePersons\": false, \"viewRoles\": false, \"editRoles\": false, \"deleteRoles\": false}', '2025-11-14 15:54:02', '2025-11-14 15:54:02'),
(3, 'دانش‌آموز', '{\"viewPlaces\": false, \"editPlaces\": false, \"deletePlaces\": false, \"viewPersons\": false, \"editPersons\": false, \"deletePersons\": false, \"viewRoles\": false, \"editRoles\": false, \"deleteRoles\": false}', '2025-11-14 15:54:02', '2025-11-14 15:54:02');

-- --------------------------------------------------------

--
-- Table structure for table `subject`
--

CREATE TABLE `subject` (
  `id` int(11) NOT NULL,
  `name` varchar(191) NOT NULL,
  `classId` int(11) NOT NULL,
  `teacherId` int(11) NOT NULL,
  `dayOfWeek` enum('شنبه','یکشنبه','دوشنبه','سه‌شنبه','چهارشنبه','پنج‌شنبه','جمعه') NOT NULL,
  `startTime` time NOT NULL,
  `endTime` time NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `id` int(11) NOT NULL,
  `fullName` varchar(191) NOT NULL,
  `nationalCode` varchar(191) NOT NULL,
  `phoneNumber` varchar(191) NOT NULL,
  `password` varchar(191) NOT NULL,
  `roleId` int(11) NOT NULL,
  `majorId` int(11) DEFAULT NULL,
  `gradeId` int(11) DEFAULT NULL,
  `classId` int(11) DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`id`, `fullName`, `nationalCode`, `phoneNumber`, `password`, `roleId`, `majorId`, `gradeId`, `classId`, `createdAt`, `updatedAt`) VALUES
(1, 'مدیر سیستم', '1', '1', '$2a$10$JYvNKrajlo4F0xaw3SUyoO8jJXnV2sSAa0BrP1iTMzE6fOFa15/3q', 1, NULL, NULL, NULL, '2025-11-14 12:45:27', '2025-11-14 12:53:32'),
(2, 'حسین ارمان پور', '1234567890', '12345678900', '$2a$10$HhvlsKrGYhNCC0V.1jH02uSqzFuVWMJuQVYPchX6KWnD5CKRKxOO2', 2, NULL, NULL, NULL, '2025-11-14 16:52:50', '2025-11-14 16:52:50'),
(3, 'احمدرضا آوندی', '3381704664', '09921386634', '$2a$10$rpu9qtf1xCfJQxIB7ZMJJOjBSV1OcN/KzytJSV5PF9kn.o/7p2HC6', 3, 1, 2, 7, '2025-11-14 21:58:58', '2025-11-16 20:06:55'),
(5, 'سید محمد مهدی اشرفی ', '۲۵۰۰۶۸۲۳۵۸', '۰۹۹۱۸۵۲۵۹۹۸', '$2a$10$o/kdoqXDzSIrNik8OWhrNurWFhDpjCYXtn36zQfiBKvxFdUylFm3e', 3, 1, 2, 7, '2025-11-15 10:56:04', '2025-11-16 20:06:36'),
(6, 'طاها هاشمی', '3381792441', '09051772977', '$2a$10$eS8IWnwAGrumr/dLyCD71OhfqN0qluk90FHLC7DLl1caYAjD7Vg.K', 3, 1, 2, 7, '2025-11-15 11:04:55', '2025-11-16 20:06:43'),
(7, 'علی اردیبهشتی', '3381695444', '09366224166', '$2a$10$PT/egeSZ.Hmf8./Oxne2JuQwLMBLISjIMvGKdSDfuzi3jgNwa45SC', 3, 1, 2, 7, '2025-11-15 11:57:00', '2025-11-16 20:07:17');

-- --------------------------------------------------------

--
-- Stand-in structure for view `v_attendance_stats`
-- (See below for the actual view)
--
CREATE TABLE `v_attendance_stats` (
`userId` int(11)
,`fullName` varchar(191)
,`nationalCode` varchar(191)
,`classId` int(11)
,`className` varchar(191)
,`presentCount` bigint(21)
,`absentCount` bigint(21)
,`totalDays` bigint(21)
,`attendancePercentage` decimal(26,2)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `v_classes_full`
-- (See below for the actual view)
--
CREATE TABLE `v_classes_full` (
`id` int(11)
,`className` varchar(191)
,`majorId` int(11)
,`majorName` varchar(191)
,`gradeId` int(11)
,`gradeName` varchar(191)
,`studentCount` bigint(21)
,`subjectCount` bigint(21)
,`createdAt` timestamp
,`updatedAt` timestamp
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `v_subjects_full`
-- (See below for the actual view)
--
CREATE TABLE `v_subjects_full` (
`id` int(11)
,`subjectName` varchar(191)
,`classId` int(11)
,`className` varchar(191)
,`teacherId` int(11)
,`teacherName` varchar(191)
,`dayOfWeek` enum('شنبه','یکشنبه','دوشنبه','سه‌شنبه','چهارشنبه','پنج‌شنبه','جمعه')
,`startTime` time
,`endTime` time
,`gradeName` varchar(191)
,`majorName` varchar(191)
,`createdAt` timestamp
,`updatedAt` timestamp
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `v_users_full`
-- (See below for the actual view)
--
CREATE TABLE `v_users_full` (
`id` int(11)
,`fullName` varchar(191)
,`nationalCode` varchar(191)
,`phoneNumber` varchar(191)
,`roleId` int(11)
,`roleName` varchar(191)
,`permissions` longtext
,`classId` int(11)
,`className` varchar(191)
,`majorId` int(11)
,`majorName` varchar(191)
,`gradeId` int(11)
,`gradeName` varchar(191)
,`createdAt` timestamp
,`updatedAt` timestamp
);

-- --------------------------------------------------------

--
-- Structure for view `v_attendance_stats`
--
DROP TABLE IF EXISTS `v_attendance_stats`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_attendance_stats`  AS SELECT `u`.`id` AS `userId`, `u`.`fullName` AS `fullName`, `u`.`nationalCode` AS `nationalCode`, `u`.`classId` AS `classId`, `c`.`name` AS `className`, count(case when `a`.`status` = 'present' then 1 end) AS `presentCount`, count(case when `a`.`status` = 'absent' then 1 end) AS `absentCount`, count(0) AS `totalDays`, round(count(case when `a`.`status` = 'present' then 1 end) * 100.0 / count(0),2) AS `attendancePercentage` FROM ((`user` `u` left join `class` `c` on(`u`.`classId` = `c`.`id`)) left join `attendance` `a` on(`u`.`nationalCode` = `a`.`nationalCode`)) WHERE `u`.`roleId` = 3 GROUP BY `u`.`id`, `u`.`fullName`, `u`.`nationalCode`, `u`.`classId`, `c`.`name` ;

-- --------------------------------------------------------

--
-- Structure for view `v_classes_full`
--
DROP TABLE IF EXISTS `v_classes_full`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_classes_full`  AS SELECT `c`.`id` AS `id`, `c`.`name` AS `className`, `c`.`majorId` AS `majorId`, `m`.`name` AS `majorName`, `c`.`gradeId` AS `gradeId`, `g`.`name` AS `gradeName`, count(distinct `u`.`id`) AS `studentCount`, count(distinct `s`.`id`) AS `subjectCount`, `c`.`createdAt` AS `createdAt`, `c`.`updatedAt` AS `updatedAt` FROM ((((`class` `c` left join `major` `m` on(`c`.`majorId` = `m`.`id`)) left join `grade` `g` on(`c`.`gradeId` = `g`.`id`)) left join `user` `u` on(`u`.`classId` = `c`.`id` and `u`.`roleId` = 3)) left join `subject` `s` on(`s`.`classId` = `c`.`id`)) GROUP BY `c`.`id`, `c`.`name`, `c`.`majorId`, `m`.`name`, `c`.`gradeId`, `g`.`name`, `c`.`createdAt`, `c`.`updatedAt` ;

-- --------------------------------------------------------

--
-- Structure for view `v_subjects_full`
--
DROP TABLE IF EXISTS `v_subjects_full`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_subjects_full`  AS SELECT `s`.`id` AS `id`, `s`.`name` AS `subjectName`, `s`.`classId` AS `classId`, `c`.`name` AS `className`, `s`.`teacherId` AS `teacherId`, `u`.`fullName` AS `teacherName`, `s`.`dayOfWeek` AS `dayOfWeek`, `s`.`startTime` AS `startTime`, `s`.`endTime` AS `endTime`, `g`.`name` AS `gradeName`, `m`.`name` AS `majorName`, `s`.`createdAt` AS `createdAt`, `s`.`updatedAt` AS `updatedAt` FROM ((((`subject` `s` join `class` `c` on(`s`.`classId` = `c`.`id`)) join `user` `u` on(`s`.`teacherId` = `u`.`id`)) left join `grade` `g` on(`c`.`gradeId` = `g`.`id`)) left join `major` `m` on(`c`.`majorId` = `m`.`id`)) ;

-- --------------------------------------------------------

--
-- Structure for view `v_users_full`
--
DROP TABLE IF EXISTS `v_users_full`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_users_full`  AS SELECT `u`.`id` AS `id`, `u`.`fullName` AS `fullName`, `u`.`nationalCode` AS `nationalCode`, `u`.`phoneNumber` AS `phoneNumber`, `u`.`roleId` AS `roleId`, `r`.`name` AS `roleName`, `r`.`permissions` AS `permissions`, `u`.`classId` AS `classId`, `c`.`name` AS `className`, `u`.`majorId` AS `majorId`, `m`.`name` AS `majorName`, `u`.`gradeId` AS `gradeId`, `g`.`name` AS `gradeName`, `u`.`createdAt` AS `createdAt`, `u`.`updatedAt` AS `updatedAt` FROM ((((`user` `u` left join `role` `r` on(`u`.`roleId` = `r`.`id`)) left join `class` `c` on(`u`.`classId` = `c`.`id`)) left join `major` `m` on(`u`.`majorId` = `m`.`id`)) left join `grade` `g` on(`u`.`gradeId` = `g`.`id`)) ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `attendance`
--
ALTER TABLE `attendance`
  ADD PRIMARY KEY (`id`),
  ADD KEY `classId` (`classId`),
  ADD KEY `idx_nationalCode` (`nationalCode`),
  ADD KEY `idx_date` (`jalali_date`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_subject` (`subjectId`),
  ADD KEY `idx_date_class` (`jalali_date`,`classId`),
  ADD KEY `idx_date_status` (`jalali_date`,`status`),
  ADD KEY `idx_user_date` (`nationalCode`,`jalali_date`);

--
-- Indexes for table `class`
--
ALTER TABLE `class`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_major` (`majorId`),
  ADD KEY `idx_grade` (`gradeId`),
  ADD KEY `idx_name` (`name`);

--
-- Indexes for table `grade`
--
ALTER TABLE `grade`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD KEY `idx_name` (`name`);

--
-- Indexes for table `last_seen`
--
ALTER TABLE `last_seen`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_nationalCode` (`nationalCode`),
  ADD KEY `idx_time` (`checkin_time`);

--
-- Indexes for table `location`
--
ALTER TABLE `location`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `major`
--
ALTER TABLE `major`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD KEY `idx_name` (`name`);

--
-- Indexes for table `role`
--
ALTER TABLE `role`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD KEY `idx_name` (`name`);

--
-- Indexes for table `subject`
--
ALTER TABLE `subject`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_class` (`classId`),
  ADD KEY `idx_teacher` (`teacherId`),
  ADD KEY `idx_day` (`dayOfWeek`),
  ADD KEY `idx_class_day` (`classId`,`dayOfWeek`),
  ADD KEY `idx_teacher_day` (`teacherId`,`dayOfWeek`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nationalCode` (`nationalCode`),
  ADD KEY `majorId` (`majorId`),
  ADD KEY `gradeId` (`gradeId`),
  ADD KEY `idx_nationalCode` (`nationalCode`),
  ADD KEY `idx_role` (`roleId`),
  ADD KEY `idx_class` (`classId`),
  ADD KEY `idx_role_class` (`roleId`,`classId`),
  ADD KEY `idx_fullname` (`fullName`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `attendance`
--
ALTER TABLE `attendance`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `class`
--
ALTER TABLE `class`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `grade`
--
ALTER TABLE `grade`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `last_seen`
--
ALTER TABLE `last_seen`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `location`
--
ALTER TABLE `location`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `major`
--
ALTER TABLE `major`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `role`
--
ALTER TABLE `role`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `subject`
--
ALTER TABLE `subject`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `attendance`
--
ALTER TABLE `attendance`
  ADD CONSTRAINT `attendance_ibfk_1` FOREIGN KEY (`classId`) REFERENCES `class` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `attendance_ibfk_2` FOREIGN KEY (`nationalCode`) REFERENCES `user` (`nationalCode`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `attendance_ibfk_3` FOREIGN KEY (`subjectId`) REFERENCES `subject` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `class`
--
ALTER TABLE `class`
  ADD CONSTRAINT `class_ibfk_1` FOREIGN KEY (`majorId`) REFERENCES `major` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `class_ibfk_2` FOREIGN KEY (`gradeId`) REFERENCES `grade` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `subject`
--
ALTER TABLE `subject`
  ADD CONSTRAINT `subject_ibfk_1` FOREIGN KEY (`classId`) REFERENCES `class` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `subject_ibfk_2` FOREIGN KEY (`teacherId`) REFERENCES `user` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `user`
--
ALTER TABLE `user`
  ADD CONSTRAINT `user_ibfk_1` FOREIGN KEY (`roleId`) REFERENCES `role` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `user_ibfk_2` FOREIGN KEY (`majorId`) REFERENCES `major` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `user_ibfk_3` FOREIGN KEY (`gradeId`) REFERENCES `grade` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `user_ibfk_4` FOREIGN KEY (`classId`) REFERENCES `class` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
