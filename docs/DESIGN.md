# 🎨 Design System Guidelines

This document outlines the design principles to ensure the UI remains professional, intuitive, and consistent across all React components in FinSight AI.

## 1. Visual Identity
- **Core Philosophy**: A "friendly chat interface" that makes financial literacy accessible and less intimidating.
- **Layout**: A Single-Page Application (SPA) feel using React for smooth transitions and immediate feedback.
- **Primary Colors**:
  - **Success (Income)**: Green
  - **Danger (Expenses)**: Red
- **Charts**: Dynamic color coding is applied to different spending categories for instant visual recognition.

## 2. Component Architecture
- **The Dashboard**: A visual landing page featuring a "Monthly Financial Statement" (Total Income vs. Total Expense) and a "Savings Rate" indicator.
- **The Chat Interface**: A familiar messaging UI (User vs. Bot bubbles) with a scrollable history log.
- **Data Inputs**: Simple, accessible forms for manual transaction entry with clear validation and error states.

## 3. Interaction Design
- **Feedback**: Graceful error handling is implemented. For example, if the AI service is down or rate-limited, the core expense tracking capabilities must still function flawlessly.
- **Responsiveness**: The interface must be usable and aesthetically pleasing across standard desktop and laptop hardware.
