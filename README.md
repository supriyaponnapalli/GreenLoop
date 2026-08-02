
# ♻️ GreenLoop: The Circular Eco-Hub (Frontend Prototype)

GreenLoop is a web-based prototype developed as a Community Service Project to combat plastic pollution. It demonstrates the user interface and basic workflow of a localized B2B marketplace that connects garbage collectors directly with the recycling industry.

**Note:** This is currently a frontend-only prototype. It does not use a live backend server or database. All data, user accounts, and transactions are simulated and stored locally in the browser.

## 🚀 Prototype Features

### 👤 User Portal (Collectors & Citizens)
* **Waste Marketplace:** Users can log simulated batches of segregated plastic waste (PET, HDPE, LDPE).
* **Impact Dashboard:** A tracking dashboard that reads the user's simulated history to calculate total waste listed and recycled, visualized with Chart.js.
* **Eco Segregation Game:** An interactive HTML5 drag-and-drop game designed to educate users on proper waste sorting.
* **DIY & Upcycling Hub:** A static gallery of practical, step-by-step DIY projects with integrated YouTube tutorial links.

### 🏭 Admin Portal (Recycling Industries)
* **Simulated Procurement Feed:** A dashboard where admin users can view the mock waste data submitted by users on the same machine.
* **Data Filtering:** Client-side filtering to sort available plastic by grade, minimum weight, and estimated distance.
* **Claim Workflow:** Admins can digitally "claim" waste lots, which updates the lot's status across the application's local state.

## 🛠️ Tech Stack

This project was built to demonstrate core UI/UX and client-side logic without requiring server deployment. 

* **Frontend:** HTML5, CSS3, Vanilla JavaScript
* **Data Visualization:** Chart.js
* **Data Simulation:** Browser `localStorage` (used to mock a relational database for users and inventory)
* **Location Logic:** A deterministic hashing algorithm to generate consistent mock distances based on user input strings.

## 💻 How to Run Locally

Because this relies purely on client-side technologies, no local server installation is required.

1. Clone this repository:
   ```bash
   git clone [https://github.com/supriyaponnapalli/GreenLoop.git](https://github.com/supriyaponnapalli/GreenLoop.git)