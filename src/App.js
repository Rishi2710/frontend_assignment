import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

// Import SVG icons
import InProgressIcon from "./assets/svg/in-progress.svg";
import TodoIcon from "./assets/svg/To-do.svg";
import DoneIcon from "./assets/svg/Done.svg";
import BacklogIcon from "./assets/svg/Backlog.svg";
import CancelledIcon from "./assets/svg/Cancelled.svg";
import HighPriorityIcon from "./assets/svg/Img - High Priority.svg";
import MediumPriorityIcon from "./assets/svg/Img - Medium Priority.svg";
import LowPriorityIcon from "./assets/svg/Img - Low Priority.svg";
import UrgentPriorityIcon from "./assets/svg/SVG - Urgent Priority colour.svg";
import NoPriorityIcon from "./assets/svg/No-priority.svg";
import DisplayIcon from "./assets/svg/Display.svg";

// Mapping for icons
const statusIcons = {
  "In progress": InProgressIcon,
  Todo: TodoIcon,
  Done: DoneIcon,
  Backlog: BacklogIcon,
  Cancelled: CancelledIcon,
};

const priorityIcons = {
  4: UrgentPriorityIcon,
  3: HighPriorityIcon,
  2: MediumPriorityIcon,
  1: LowPriorityIcon,
  0: NoPriorityIcon,
};

const priorityMapping = {
  4: "Urgent",
  3: "High",
  2: "Medium",
  1: "Low",
  0: "No Priority",
};

const App = () => {
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [groupBy, setGroupBy] = useState("status");
  const [sortBy, setSortBy] = useState("priority");
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    axios
      .get("https://api.quicksell.co/v1/internal/frontend-assignment")
      .then((response) => {
        setTickets(response.data.tickets);
        setUsers(response.data.users);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching tickets:", error);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;

  const getUserName = (userId) => {
    const user = users.find((u) => u.id === userId);
    return user ? user.name : "Unknown";
  };

  const getPriorityLabel = (group) => {
    if (priorityMapping.hasOwnProperty(group)) {
      return (
        <div className="priority-header">
          <img
            src={priorityIcons[group]}
            alt={priorityMapping[group]}
            className="icon"
          />
          <span>{priorityMapping[group]}</span>
        </div>
      );
    }
    return (
      <div className="priority-header">
        <img src={NoPriorityIcon} alt="No Priority" className="icon" />
        <span>No Priority</span>
      </div>
    );
  };

  const groupedTickets = tickets.reduce((groups, ticket) => {
    const groupKey = ticket[groupBy] || "Uncategorized";
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(ticket);
    return groups;
  }, {});

  const statusOrder = ["Todo", "In progress", "Done", "Backlog", "Cancelled"];
  if (groupBy === "status") {
    statusOrder.forEach((status) => {
      if (!groupedTickets[status]) {
        groupedTickets[status] = [];
      }
    });
  }

  Object.keys(groupedTickets).forEach((key) => {
    groupedTickets[key].sort((a, b) => {
      if (sortBy === "priority") return (b.priority || 0) - (a.priority || 0);
      if (sortBy === "title") return (a.title || "").localeCompare(b.title || "");
      return 0;
    });
  });

  return (
    <div style={{ backgroundColor: "#ffffff" }}>
      <div className="display-row">
        <button
          className="display-button"
          onClick={() => setShowDropdown((prev) => !prev)}
        >
          <img src={DisplayIcon} alt="Display Icon" className="display-icon" />
          Display
        </button>

        {showDropdown && (
          <div className="dropdown">
            <div className="dropdown-group">
              <label>Grouping</label>
              <select value={groupBy} onChange={(e) => setGroupBy(e.target.value)}>
                <option value="status">Status</option>
                <option value="userId">User</option>
                <option value="priority">Priority</option>
              </select>
            </div>
            <div className="dropdown-group">
              <label>Ordering</label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="priority">Priority</option>
                <option value="title">Title</option>
              </select>
            </div>
          </div>
        )}
      </div>

      <div className="kanban-board">
        {Object.entries(groupedTickets).map(([group, tickets]) => (
          <div key={group} className="column">
            <h2 className="column-header">
              {groupBy === "userId" ? (
                <div className="user-header">
  {/* Circular avatar with initials */}
  <div className="user-avatar-circle">
    {getUserName(group)
      .split(" ") // Split the name into parts
      .map((name) => name.charAt(0)) // Get the first letter of each part
      .join("")} {/* Join the initials */}
  </div>
  {/* Full name next to the avatar */}
  <span className="user-name">{getUserName(group)}</span>
</div>

              ) : groupBy === "priority" ? (
                getPriorityLabel(group)
              ) : groupBy === "status" && statusIcons[group] ? (
                <div className="status-header">
                  <img src={statusIcons[group]} alt={group} className="icon" />
                  <span>{group}</span>
                </div>
              ) : (
                group
              )}
              <span className="ticket-count">{tickets.length}</span>
              <div className="column-controls">
                <button className="add-button">+</button>
                <button className="menu-button">...</button>
              </div>
            </h2>
            {tickets.map((ticket) => (
              <div key={ticket.id} className="card">
                <div className="card-top">
                  <span className="ticket-id">{ticket.id}</span>
                  <div className="user-avatar-box">{getUserName(ticket.userId)}</div>
                </div>

                <div className="ticket-title">
                  <img
                    src={statusIcons[ticket.status] || BacklogIcon}
                    alt={ticket.status}
                    className="icon status-icon"
                  />
                  <h3>{ticket.title}</h3>
                </div>

                <div className="ticket-meta">
                  <div className="ticket-tags">
                    {ticket.tag.map((tag, index) => (
                      <span key={index} className="tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="priority">
                    <img
                      src={priorityIcons[ticket.priority] || NoPriorityIcon}
                      alt={`Priority ${ticket.priority}`}
                      className="icon"
                    />
                    <span>{priorityMapping[ticket.priority]}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
