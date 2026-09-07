-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 07, 2026 at 03:47 AM
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
-- Database: `weekly_report_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `achievements`
--

CREATE TABLE `achievements` (
  `id` int(11) NOT NULL,
  `report_id` int(11) NOT NULL,
  `description` text NOT NULL,
  `is_key_achievement` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `achievements`
--

INSERT INTO `achievements` (`id`, `report_id`, `description`, `is_key_achievement`, `created_at`) VALUES
(1, 1, 'test', 0, '2026-09-05 14:38:49'),
(2, 2, 'Routes', 0, '2026-09-06 02:40:33'),
(3, 5, 'Successfully merged the checkout integration PR after code review.', 1, '2026-09-07 01:35:10'),
(4, 6, 'Reduced dashboard load time by caching the aggregation query.', 1, '2026-09-07 01:35:10'),
(5, 7, 'Completed first round of research interviews for the recommendation engine.', 0, '2026-09-07 01:35:10'),
(6, 8, 'Outlined the full RBAC test plan for next sprint.', 0, '2026-09-07 01:35:10'),
(7, 9, 'Set up the base project structure for the outbound tracking feature.', 1, '2026-09-07 01:35:10');

-- --------------------------------------------------------

--
-- Table structure for table `blockers`
--

CREATE TABLE `blockers` (
  `id` int(11) NOT NULL,
  `report_id` int(11) NOT NULL,
  `description` text NOT NULL,
  `is_key_issue` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `blockers`
--

INSERT INTO `blockers` (`id`, `report_id`, `description`, `is_key_issue`, `created_at`) VALUES
(1, 1, 'test', 0, '2026-09-05 14:38:46'),
(2, 2, 'APIs', 0, '2026-09-06 02:40:23'),
(3, 5, 'Waiting on sandbox credentials from the payment provider.', 1, '2026-09-07 01:35:10'),
(4, 6, 'Data source for conversion metrics is refreshed only once a day.', 0, '2026-09-07 01:35:10'),
(5, 7, 'Conflicting feedback from two stakeholders on the recommendation approach.', 1, '2026-09-07 01:35:10'),
(6, 8, 'No blockers this week.', 0, '2026-09-07 01:35:10'),
(7, 9, 'Warehouse system API docs from the logistics team are outdated.', 1, '2026-09-07 01:35:10');

-- --------------------------------------------------------

--
-- Table structure for table `hours_breakdown`
--

CREATE TABLE `hours_breakdown` (
  `id` int(11) NOT NULL,
  `report_id` int(11) NOT NULL,
  `task_type` varchar(50) NOT NULL,
  `hours` decimal(5,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `hours_breakdown`
--

INSERT INTO `hours_breakdown` (`id`, `report_id`, `task_type`, `hours`) VALUES
(1, 2, 'Development', 2.50),
(2, 2, 'Testing', 0.50),
(3, 2, 'Meetings', 0.50),
(4, 2, 'Documentation', 1.00),
(5, 5, 'Development', 18.50),
(6, 6, 'Development', 10.00),
(7, 7, 'Documentation', 5.00),
(8, 8, 'Meetings', 3.00),
(9, 9, 'Development', 4.00);

-- --------------------------------------------------------

--
-- Table structure for table `projects`
--

CREATE TABLE `projects` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `projects`
--

INSERT INTO `projects` (`id`, `name`, `description`, `created_at`, `updated_at`) VALUES
(1, 'ABC Pvt Ltd', 'E-Commerce automation web app', '2026-09-03 15:05:04', '2026-09-06 00:53:59'),
(2, 'Test Pvt ltd', 'Social Media Managment', '2026-09-03 15:05:04', '2026-09-06 00:54:56'),
(3, 'R&D Project', 'Research and development initiatives', '2026-09-03 15:05:04', '2026-09-06 00:56:16'),
(4, 'Marketing Dashboard', 'Accounts Analysis and Distribution BI Dashboard', '2026-09-03 15:05:04', '2026-09-06 00:58:33'),
(5, 'Warehouse Efficency Automation System', 'Logistic Inbound and Outbound Efficency Tracker System', '2026-09-06 00:58:13', '2026-09-06 00:58:13'),
(6, 'RBAC Test Project', 'Automated RBAC test', '2026-09-06 09:21:24', '2026-09-06 09:21:24');

-- --------------------------------------------------------

--
-- Table structure for table `reports`
--

CREATE TABLE `reports` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `project_id` int(11) DEFAULT NULL,
  `week_start` date NOT NULL,
  `week_end` date NOT NULL,
  `status` enum('draft','submitted','needs_correction','approved') NOT NULL DEFAULT 'draft',
  `tasks_planned_next_week` text DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `latest_comment` text DEFAULT NULL,
  `reviewed_by` int(11) DEFAULT NULL,
  `submitted_at` timestamp NULL DEFAULT NULL,
  `reviewed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `reports`
--

INSERT INTO `reports` (`id`, `user_id`, `project_id`, `week_start`, `week_end`, `status`, `tasks_planned_next_week`, `notes`, `latest_comment`, `reviewed_by`, `submitted_at`, `reviewed_at`, `created_at`, `updated_at`) VALUES
(1, 6, 1, '2026-08-30', '2026-09-05', 'approved', 'TEST', 'TEST', NULL, 7, '2026-09-06 03:55:13', '2026-09-06 03:55:32', '2026-09-05 14:25:06', '2026-09-06 03:55:32'),
(2, 10, 3, '2026-09-06', '2026-09-12', 'submitted', 'Generate the Development routes and APIS', NULL, NULL, NULL, '2026-09-06 02:41:20', NULL, '2026-09-06 02:39:38', '2026-09-06 02:41:20'),
(3, 11, 5, '2026-09-13', '2026-09-12', 'submitted', NULL, NULL, NULL, NULL, '2026-09-06 03:57:44', NULL, '2026-09-06 03:56:54', '2026-09-06 03:57:44'),
(4, 11, 3, '2026-08-30', '2026-09-05', 'submitted', NULL, NULL, NULL, NULL, '2026-09-06 09:28:14', NULL, '2026-09-06 09:27:30', '2026-09-06 09:28:14'),
(5, 9, 1, '2026-08-25', '2026-08-29', 'approved', 'Start integrating the automated checkout flow with the payment gateway.', 'Staging build: https://staging.example.com', 'Looks good, approved.', 7, '2026-08-29 11:00:00', '2026-08-30 03:45:00', '2026-09-07 01:35:10', '2026-09-07 01:35:10'),
(6, 10, 4, '2026-08-25', '2026-08-29', 'approved', 'Add distribution breakdown charts to the BI dashboard.', NULL, 'Nicely documented, approved.', 7, '2026-08-29 11:35:00', '2026-08-30 04:30:00', '2026-09-07 01:35:10', '2026-09-07 01:35:10'),
(7, 11, 3, '2026-08-25', '2026-08-29', 'needs_correction', 'Continue feasibility research on the recommendation engine.', 'Research doc: https://docs.example.com/rnd', 'Please add more detail on the blocker you flagged before resubmitting.', 7, '2026-08-29 09:30:00', '2026-08-30 05:50:00', '2026-09-07 01:35:10', '2026-09-07 01:35:10'),
(8, 6, 6, '2026-08-25', '2026-08-29', 'draft', NULL, NULL, NULL, NULL, NULL, NULL, '2026-09-07 01:35:10', '2026-09-07 01:35:10'),
(9, 12, 5, '2026-09-01', '2026-09-05', 'submitted', 'Begin work on the outbound tracking module.', NULL, NULL, NULL, '2026-09-05 12:30:00', NULL, '2026-09-07 01:35:10', '2026-09-07 01:35:10');

-- --------------------------------------------------------

--
-- Table structure for table `report_versions`
--

CREATE TABLE `report_versions` (
  `id` int(11) NOT NULL,
  `report_id` int(11) NOT NULL,
  `content_snapshot` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`content_snapshot`)),
  `submitted_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `report_versions`
--

INSERT INTO `report_versions` (`id`, `report_id`, `content_snapshot`, `submitted_at`) VALUES
(1, 1, '{\"report\":{\"id\":1,\"user_id\":6,\"project_id\":1,\"week_start\":\"2026-08-29T18:30:00.000Z\",\"week_end\":\"2026-09-04T18:30:00.000Z\",\"status\":\"draft\",\"tasks_planned_next_week\":\"TEST\",\"notes\":\"TEST\",\"latest_comment\":null,\"reviewed_by\":null,\"submitted_at\":null,\"reviewed_at\":null,\"created_at\":\"2026-09-05T14:25:06.000Z\",\"updated_at\":\"2026-09-05T14:25:06.000Z\"},\"tasks\":[{\"id\":1,\"report_id\":1,\"task_name\":\"test\",\"priority\":\"low\",\"planned_percent\":1,\"actual_percent\":1,\"status\":\"in_progress\",\"time_planned_hours\":\"1.00\",\"time_spent_hours\":\"1.00\",\"deliverable\":\"test\",\"created_at\":\"2026-09-05T14:38:40.000Z\"}],\"blockers\":[{\"id\":1,\"report_id\":1,\"description\":\"test\",\"is_key_issue\":0,\"created_at\":\"2026-09-05T14:38:46.000Z\"}],\"achievements\":[{\"id\":1,\"report_id\":1,\"description\":\"test\",\"is_key_achievement\":0,\"created_at\":\"2026-09-05T14:38:49.000Z\"}]}', '2026-09-05 14:38:51'),
(2, 2, '{\"report\":{\"id\":2,\"user_id\":10,\"project_id\":3,\"week_start\":\"2026-09-05T18:30:00.000Z\",\"week_end\":\"2026-09-11T18:30:00.000Z\",\"status\":\"draft\",\"tasks_planned_next_week\":\"Generate the Development routes and APIS\",\"notes\":null,\"latest_comment\":null,\"reviewed_by\":null,\"submitted_at\":null,\"reviewed_at\":null,\"created_at\":\"2026-09-06T02:39:38.000Z\",\"updated_at\":\"2026-09-06T02:39:38.000Z\"},\"tasks\":[{\"id\":2,\"report_id\":2,\"task_name\":\"Create the Routes\",\"priority\":\"high\",\"planned_percent\":2,\"actual_percent\":1,\"status\":\"in_progress\",\"time_planned_hours\":\"1.00\",\"time_spent_hours\":\"0.00\",\"deliverable\":null,\"created_at\":\"2026-09-06T02:40:08.000Z\"}],\"blockers\":[{\"id\":2,\"report_id\":2,\"description\":\"APIs\",\"is_key_issue\":0,\"created_at\":\"2026-09-06T02:40:23.000Z\"}],\"achievements\":[{\"id\":2,\"report_id\":2,\"description\":\"Routes\",\"is_key_achievement\":0,\"created_at\":\"2026-09-06T02:40:33.000Z\"}]}', '2026-09-06 02:41:20'),
(3, 1, '{\"report\":{\"id\":1,\"user_id\":6,\"project_id\":1,\"week_start\":\"2026-08-29T18:30:00.000Z\",\"week_end\":\"2026-09-04T18:30:00.000Z\",\"status\":\"needs_correction\",\"tasks_planned_next_week\":\"TEST\",\"notes\":\"TEST\",\"latest_comment\":\"test\",\"reviewed_by\":7,\"submitted_at\":\"2026-09-05T14:38:51.000Z\",\"reviewed_at\":\"2026-09-05T14:43:36.000Z\",\"created_at\":\"2026-09-05T14:25:06.000Z\",\"updated_at\":\"2026-09-05T14:43:36.000Z\"},\"tasks\":[{\"id\":1,\"report_id\":1,\"task_name\":\"test\",\"priority\":\"low\",\"planned_percent\":1,\"actual_percent\":1,\"status\":\"in_progress\",\"time_planned_hours\":\"1.00\",\"time_spent_hours\":\"1.00\",\"deliverable\":\"test\",\"created_at\":\"2026-09-05T14:38:40.000Z\"}],\"blockers\":[{\"id\":1,\"report_id\":1,\"description\":\"test\",\"is_key_issue\":0,\"created_at\":\"2026-09-05T14:38:46.000Z\"}],\"achievements\":[{\"id\":1,\"report_id\":1,\"description\":\"test\",\"is_key_achievement\":0,\"created_at\":\"2026-09-05T14:38:49.000Z\"}]}', '2026-09-06 03:55:13'),
(4, 3, '{\"report\":{\"id\":3,\"user_id\":11,\"project_id\":5,\"week_start\":\"2026-09-12T18:30:00.000Z\",\"week_end\":\"2026-09-11T18:30:00.000Z\",\"status\":\"draft\",\"tasks_planned_next_week\":null,\"notes\":null,\"latest_comment\":null,\"reviewed_by\":null,\"submitted_at\":null,\"reviewed_at\":null,\"created_at\":\"2026-09-06T03:56:54.000Z\",\"updated_at\":\"2026-09-06T03:56:54.000Z\"},\"tasks\":[{\"id\":3,\"report_id\":3,\"task_name\":\"Backend routes created\",\"priority\":\"medium\",\"planned_percent\":1,\"actual_percent\":1,\"status\":\"completed\",\"time_planned_hours\":\"3.00\",\"time_spent_hours\":\"1.00\",\"deliverable\":null,\"created_at\":\"2026-09-06T03:57:35.000Z\"}],\"blockers\":[],\"achievements\":[]}', '2026-09-06 03:57:44'),
(5, 4, '{\"report\":{\"id\":4,\"user_id\":11,\"project_id\":3,\"week_start\":\"2026-08-29T18:30:00.000Z\",\"week_end\":\"2026-09-04T18:30:00.000Z\",\"status\":\"draft\",\"tasks_planned_next_week\":null,\"notes\":null,\"latest_comment\":null,\"reviewed_by\":null,\"submitted_at\":null,\"reviewed_at\":null,\"created_at\":\"2026-09-06T09:27:30.000Z\",\"updated_at\":\"2026-09-06T09:27:30.000Z\"},\"tasks\":[{\"id\":4,\"report_id\":4,\"task_name\":\"api\",\"priority\":\"high\",\"planned_percent\":1,\"actual_percent\":1,\"status\":\"completed\",\"time_planned_hours\":\"3.00\",\"time_spent_hours\":\"1.00\",\"deliverable\":\"yes\",\"created_at\":\"2026-09-06T09:28:11.000Z\"}],\"blockers\":[],\"achievements\":[]}', '2026-09-06 09:28:14'),
(6, 5, '{\"tasks_planned_next_week\": \"Start checkout flow integration.\", \"notes\": \"First draft, missing staging link.\"}', '2026-08-28 06:30:00'),
(7, 5, '{\"tasks_planned_next_week\": \"Start integrating the automated checkout flow with the payment gateway.\", \"notes\": \"Staging build: https://staging.example.com\"}', '2026-08-29 11:00:00'),
(8, 6, '{\"tasks_planned_next_week\": \"Add distribution breakdown charts.\", \"notes\": null}', '2026-08-27 08:40:00'),
(9, 6, '{\"tasks_planned_next_week\": \"Add distribution breakdown charts to the BI dashboard.\", \"notes\": \"Added the missing conversion metrics as requested.\"}', '2026-08-29 11:35:00'),
(10, 7, '{\"tasks_planned_next_week\": \"Continue feasibility research on the recommendation engine.\", \"notes\": \"Research doc: https://docs.example.com/rnd\"}', '2026-08-29 09:30:00'),
(11, 9, '{\"tasks_planned_next_week\": \"Begin work on the outbound tracking module.\", \"notes\": null}', '2026-09-05 12:30:00');

-- --------------------------------------------------------

--
-- Table structure for table `review_comments`
--

CREATE TABLE `review_comments` (
  `id` int(11) NOT NULL,
  `report_id` int(11) NOT NULL,
  `report_version_id` int(11) DEFAULT NULL,
  `manager_id` int(11) NOT NULL,
  `comment` text NOT NULL,
  `action` enum('approved','requested_changes') NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `review_comments`
--

INSERT INTO `review_comments` (`id`, `report_id`, `report_version_id`, `manager_id`, `comment`, `action`, `created_at`) VALUES
(1, 1, 1, 7, 'test', 'requested_changes', '2026-09-05 14:43:36'),
(2, 1, 3, 7, 'Approved', 'approved', '2026-09-06 03:55:32'),
(3, 5, 6, 7, 'Please add the staging build link before resubmitting.', 'requested_changes', '2026-09-07 01:35:10'),
(4, 5, 7, 7, 'Looks good, approved.', 'approved', '2026-09-07 01:35:10'),
(5, 6, 8, 7, 'Can you add the conversion metrics before I approve this?', 'requested_changes', '2026-09-07 01:35:10'),
(6, 6, 9, 7, 'Nicely documented, approved.', 'approved', '2026-09-07 01:35:10'),
(7, 7, 10, 7, 'Please add more detail on the blocker you flagged before resubmitting.', 'requested_changes', '2026-09-07 01:35:10');

-- --------------------------------------------------------

--
-- Table structure for table `tasks`
--

CREATE TABLE `tasks` (
  `id` int(11) NOT NULL,
  `report_id` int(11) NOT NULL,
  `task_name` varchar(255) NOT NULL,
  `priority` enum('low','medium','high') DEFAULT 'medium',
  `planned_percent` int(11) DEFAULT 0,
  `actual_percent` int(11) DEFAULT 0,
  `status` enum('not_started','in_progress','completed','blocked') DEFAULT 'not_started',
  `time_planned_hours` decimal(5,2) DEFAULT 0.00,
  `time_spent_hours` decimal(5,2) DEFAULT 0.00,
  `deliverable` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tasks`
--

INSERT INTO `tasks` (`id`, `report_id`, `task_name`, `priority`, `planned_percent`, `actual_percent`, `status`, `time_planned_hours`, `time_spent_hours`, `deliverable`, `created_at`) VALUES
(1, 1, 'test', 'low', 1, 1, 'in_progress', 1.00, 1.00, 'test', '2026-09-05 14:38:40'),
(2, 2, 'Create the Routes', 'high', 2, 1, 'in_progress', 1.00, 0.00, NULL, '2026-09-06 02:40:08'),
(3, 3, 'Backend routes created', 'medium', 1, 1, 'completed', 3.00, 1.00, NULL, '2026-09-06 03:57:35'),
(4, 4, 'api', 'high', 1, 1, 'completed', 3.00, 1.00, 'yes', '2026-09-06 09:28:11'),
(5, 5, 'Integrate payment gateway for automated checkout', 'high', 100, 100, 'completed', 16.00, 18.50, 'PR #142 merged to main', '2026-09-07 01:35:10'),
(6, 6, 'Build distribution breakdown chart module', 'medium', 100, 90, 'in_progress', 12.00, 10.00, 'Dashboard module in dashboard/reports/', '2026-09-07 01:35:10'),
(7, 7, 'Research feasibility of recommendation engine', 'high', 80, 60, 'in_progress', 20.00, 14.00, 'Research doc v2', '2026-09-07 01:35:10'),
(8, 8, 'Write automated RBAC test cases', 'medium', 0, 0, 'not_started', 6.00, 0.00, NULL, '2026-09-07 01:35:10'),
(9, 9, 'Build outbound tracking endpoint', 'medium', 50, 20, 'in_progress', 10.00, 4.00, NULL, '2026-09-07 01:35:10');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('team_member','manager') NOT NULL DEFAULT 'team_member',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `role`, `created_at`, `updated_at`) VALUES
(6, 'Test test', 'test@gmail.com', '$2b$10$W.uZcwyqXFdrMnGoLBQkwuDJ/p/PShW9XGDtfrNaq6t702Ob/Ho1K', 'team_member', '2026-09-05 09:45:07', '2026-09-07 01:16:59'),
(7, 'ADMIN', 'admin@gmail.com', '$2b$10$ObUkBg4pK2HjAEBkVyR/MuqwlV31VHUjGFMvryD6Gq5VulWmYaAI6', 'manager', '2026-09-05 14:26:01', '2026-09-05 14:26:01'),
(9, 'Dulakshi', 'dulakshi@gmail.com', '$2b$10$OZ9uM.2BEgkM.ywkwZ9OHu1f5EJRdgf22Z/4O4cy2w9nMjxnJ7iMy', 'team_member', '2026-09-06 00:50:25', '2026-09-06 00:50:25'),
(10, 'Keshani', 'keshani@gmail.com', '$2b$10$EaiUbJlskevqm8EGMZDWXumWXxhzEkeKtMI.YBDttohI0QvSslWOO', 'team_member', '2026-09-06 00:50:54', '2026-09-06 00:50:54'),
(11, 'Tharuki', 'tharu@gmail.com', '$2b$10$htG8QSAhuuKd29KnrWLlRuHO.V0o7uamy2DnvsQ4tAtCdL5FaWys6', 'team_member', '2026-09-06 00:51:21', '2026-09-06 00:51:21'),
(12, 'Wasana Deu', 'deu@gmail.com', '$2b$10$bTl8Lxr2sqowkv2Vfwrn7Opr0X.PJzJiCQb6fCUv8q6KgvsXIewSy', 'team_member', '2026-09-07 01:17:46', '2026-09-07 01:17:46');

-- --------------------------------------------------------

--
-- Table structure for table `user_projects`
--

CREATE TABLE `user_projects` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `project_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_projects`
--

INSERT INTO `user_projects` (`id`, `user_id`, `project_id`) VALUES
(5, 6, 2),
(4, 6, 6),
(1, 9, 1),
(2, 10, 4),
(3, 11, 3),
(6, 12, 5);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `achievements`
--
ALTER TABLE `achievements`
  ADD PRIMARY KEY (`id`),
  ADD KEY `report_id` (`report_id`);

--
-- Indexes for table `blockers`
--
ALTER TABLE `blockers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `report_id` (`report_id`);

--
-- Indexes for table `hours_breakdown`
--
ALTER TABLE `hours_breakdown`
  ADD PRIMARY KEY (`id`),
  ADD KEY `report_id` (`report_id`);

--
-- Indexes for table `projects`
--
ALTER TABLE `projects`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `reports`
--
ALTER TABLE `reports`
  ADD PRIMARY KEY (`id`),
  ADD KEY `reviewed_by` (`reviewed_by`),
  ADD KEY `idx_reports_user` (`user_id`),
  ADD KEY `idx_reports_project` (`project_id`),
  ADD KEY `idx_reports_status` (`status`),
  ADD KEY `idx_reports_week` (`week_start`,`week_end`);

--
-- Indexes for table `report_versions`
--
ALTER TABLE `report_versions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_report_versions_report` (`report_id`);

--
-- Indexes for table `review_comments`
--
ALTER TABLE `review_comments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `report_id` (`report_id`),
  ADD KEY `report_version_id` (`report_version_id`),
  ADD KEY `manager_id` (`manager_id`);

--
-- Indexes for table `tasks`
--
ALTER TABLE `tasks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_tasks_report` (`report_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `user_projects`
--
ALTER TABLE `user_projects`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_project` (`user_id`,`project_id`),
  ADD KEY `project_id` (`project_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `achievements`
--
ALTER TABLE `achievements`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `blockers`
--
ALTER TABLE `blockers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `hours_breakdown`
--
ALTER TABLE `hours_breakdown`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `projects`
--
ALTER TABLE `projects`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `reports`
--
ALTER TABLE `reports`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `report_versions`
--
ALTER TABLE `report_versions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `review_comments`
--
ALTER TABLE `review_comments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `tasks`
--
ALTER TABLE `tasks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `user_projects`
--
ALTER TABLE `user_projects`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `achievements`
--
ALTER TABLE `achievements`
  ADD CONSTRAINT `achievements_ibfk_1` FOREIGN KEY (`report_id`) REFERENCES `reports` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `blockers`
--
ALTER TABLE `blockers`
  ADD CONSTRAINT `blockers_ibfk_1` FOREIGN KEY (`report_id`) REFERENCES `reports` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `hours_breakdown`
--
ALTER TABLE `hours_breakdown`
  ADD CONSTRAINT `hours_breakdown_ibfk_1` FOREIGN KEY (`report_id`) REFERENCES `reports` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `reports`
--
ALTER TABLE `reports`
  ADD CONSTRAINT `reports_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reports_ibfk_2` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `reports_ibfk_3` FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `report_versions`
--
ALTER TABLE `report_versions`
  ADD CONSTRAINT `report_versions_ibfk_1` FOREIGN KEY (`report_id`) REFERENCES `reports` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `review_comments`
--
ALTER TABLE `review_comments`
  ADD CONSTRAINT `review_comments_ibfk_1` FOREIGN KEY (`report_id`) REFERENCES `reports` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `review_comments_ibfk_2` FOREIGN KEY (`report_version_id`) REFERENCES `report_versions` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `review_comments_ibfk_3` FOREIGN KEY (`manager_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `tasks`
--
ALTER TABLE `tasks`
  ADD CONSTRAINT `tasks_ibfk_1` FOREIGN KEY (`report_id`) REFERENCES `reports` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_projects`
--
ALTER TABLE `user_projects`
  ADD CONSTRAINT `user_projects_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_projects_ibfk_2` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
