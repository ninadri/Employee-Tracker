const express = require("express");
const inquirer = require("inquirer");
const { Pool } = require("pg");

const app = express();
const PORT = process.env.PORT || 3001;

const pool = new Pool({
  user: "your_db_user", // Replace with your database user
  password: "your_db_password", // Replace with your database password
  host: "localhost",
  database: "employees_db", // Replace with your database name
});

const startApp = async () => {
  const { action } = await inquirer.prompt([
    {
      type: "list",
      message: "What would you like to do?",
      name: "action",
      choices: [
        "View All Employees",
        "Add Employee",
        "Update Employee Role",
        "View All Roles",
        "Add Role",
        "View All Departments",
        "Add Department",
      ],
    },
  ]);

  switch (action) {
    case "View All Employees":
      viewAllEmployees();
      break;
    case "Add Employee":
      addEmployee();
      break;
    case "Update Employee Role":
      updateEmployeeRole();
      break;
    case "View All Roles":
      viewAllRoles();
      break;
    case "Add Role":
      addRole();
      break;
    case "View All Departments":
      viewAllDepartments();
      break;
    case "Add Department":
      addDepartment();
      break;
    default:
      console.log("Invalid action");
      break;
  }
};

const viewAllDepartments = async () => {
  const res = await pool.query("SELECT * FROM departments");
  console.table(res.rows);
  startApp();
};

const viewAllRoles = async () => {
  const res = await pool.query("SELECT * FROM roles");
  console.table(res.rows);
  startApp();
};

const viewAllEmployees = async () => {
  const res = await pool.query("SELECT * FROM employees");
  console.table(res.rows);
  startApp();
};

const addDepartment = async () => {
  const { name } = await inquirer.prompt([
    {
      type: "input",
      message: "What is the name of the department?",
      name: "department",
    },
  ]);
  await pool.query("INSERT INTO departments (department_name) VALUES ($1)", [
    name,
  ]);
  console.log(`Added ${name} to the database`);
  startApp();
};

const addRole = async () => {
  const { title, salary, departmentId } = await inquirer.prompt([
    {
      type: "input",
      message: "What is the name of the role?",
      name: "role",
    },
    {
      type: "input",
      message: "What is the salary of the role?",
      name: "salary",
    },
    {
      type: "input",
      message: "Which department does the role belong to?",
      name: "departmentId",
    },
  ]);
  await pool.query(
    "INSERT INTO roles (title, salary, department_id) VALUES ($1, $2, $3)",
    [title, salary, departmentId]
  );
  console.log(`Added ${title} to the database`);
  startApp();
};

const addEmployee = async () => {
  const { firstName, lastName, roleId, managerId } = await inquirer.prompt([
    {
      type: "input",
      message: "What is the employee's first name?",
      name: "firstName",
    },
    {
      type: "input",
      message: "What is the employee's last name?",
      name: "lastName",
    },
    {
      type: "input",
      message: "What is the employee's role?",
      name: "roleId",
    },
    {
      type: "input",
      message: "Who is the employee's manager?",
      name: "managerName",
    },
  ]);
  await pool.query(
    "INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)",
    [firstName, lastName, roleId, managerName || null]
  );
  console.log(`Added ${firstName} ${lastName} to the database`);
  startApp();
};

const updateEmployeeRole = async () => {
  const { employeeId, newRoleId } = await inquirer.prompt([
    {
      type: "input",
      message: "Which employee's role do you want to update?",
      name: "employeeName",
    },
    {
      type: "input",
      message: "Which role do you want to assign the selected employee?",
      name: "newRole",
    },
  ]);
  await pool.query("UPDATE employees SET role_id = $1 WHERE id = $2", [
    newRole,
    employeeName,
  ]);
  console.log(`Updated employee's role`);
  startApp();
};

pool.connect((err) => {
  if (err) throw err;
  console.log("Connected to the database.");
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    startApp();
  });
});
