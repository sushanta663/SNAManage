# SNAManage

Online application for handling departmental activities: UG/PG requests (leave, course registration, thesis, etc.) with Faculty and HOD approval, and project allocation.
Frontend: React. Backend: Node.js + Express. Database: MongoDB.

## Architecture: workflow based

Every request moves through a fixed approval path defined in one file, `backend/workflows.js`:

    Student submits -> FACULTY approves -> HOD approves -> APPROVED
                          (reject at any step -> REJECTED, with a reason)

- Each request stores its path (`steps`), the current step, a status and a history of who did what.
- A person can only act when the current step matches their role, so the order is enforced by the server.
- Project allocation uses the same idea: applied -> faculty-approved -> allocated.
- To add a new activity or change who approves, edit only `workflows.js`.

Layers: React pages -> REST API (Express) -> workflow rules -> MongoDB (User, Request, Project, Allocation).

## Roles
- Student (UG or PG): raise requests, apply for projects, track approval steps.
- Faculty: approve/reject requests, post projects, shortlist applicants.
- HOD: final approval of requests and project allocations, sees all requests.

Faculty/HOD must enter the department staff code at registration (`STAFF_CODE` in `.env`).

## Run

Backend:

    cd backend
    cp .env.example .env
    npm install
    npm start

Frontend (new terminal):

    cd frontend
    cp .env.example .env
    npm install
    npm start

MongoDB must be running (local `mongod` or an Atlas connection string in `MONGO_URI`).

## Demo flow
1. Register a Student (UG), a Faculty and an HOD (staff code: `snamanage`).
2. Student: Requests -> raise "Course Registration" and watch the tracker.
3. Faculty: approve it. HOD: approve it. Student sees APPROVED.
4. Faculty: Projects -> post a UG project with 2 slots.
5. Student: apply. Faculty approves, then HOD approves -> appears in Final Allocations.
6. Reject something with a reason to show the red path.
