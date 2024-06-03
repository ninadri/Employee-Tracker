const express = require("express");
const inquirer = require("inquirer");
const { Pool } = require("pg");

const app = express();
const PORT = process.env.PORT || 3001;

const pool = new Pool({
  user: "postgres",
  password: "imdoinggreat", // Replace with your database password
  host: "localhost",
  database: "employees_db",
});
async function main() {
  while (true) {
    const { action } = await inquirer.prompt([
      {
        type: "list",
        name: "action",
        message: "What would you like to do?",
        choices: [
          "View All Employees",
          "Add Employee",
          "Update Employee Role",
          "View All Roles",
          "Add Role",
          "View All Departments",
          "Add Department",
          "Quit",
        ],
      },
    ]);

    switch (action) {
      case "View All Employees":
        const employees = await getEmployees();
        console.table(employees);
        break;
      case "Add Employee":
        const { firstName } = await inquirer.prompt([
          {
            type: "input",
            name: "firstName",
            message: "What is the employee's first name?",
          },
        ]);

        const { lastName } = await inquirer.prompt([
          {
            type: "input",
            name: "lastName",
            message: "What is the employee's last name?",
          },
        ]);

        const roles = await getRoles();
        const { roleId } = await inquirer.prompt([
          {
            type: "list",
            name: "roleId",
            message: "What is the employee's role?",
            choices: roles.map((role) => ({
              name: role.title,
              value: role.id,
            })),
          },
        ]);

        const managers = await getEmployees();
        const { managerId } = await inquirer.prompt([
          {
            type: "list",
            name: "managerId",
            message: "Who is the employee's manager?",
            choices: managers.map((manager) => ({
              name: `${manager.first_name} ${manager.last_name}`,
              value: manager.id,
            })),
          },
        ]);

        await addEmployee(firstName, lastName, roleId, managerId);
        break;
      case "Update Employee Role":
        const employeesToUpdate = await getEmployees();
        const { employeeId } = await inquirer.prompt([
          {
            type: "list",
            name: "employeeId",
            message: "Which employee's role do you want to update?",
            choices: employeesToUpdate.map((employee) => ({
              name: `${employee.first_name} ${employee.last_name}`,
              value: employee.id,
            })),
          },
        ]);

        const rolesToUpdate = await getRoles();
        const { newRoleId } = await inquirer.prompt([
          {
            type: "list",
            name: "newRoleId",
            message: "Which role do you want to assign the selected employee?",
            choices: rolesToUpdate.map((role) => ({
              name: role.title,
              value: role.id,
            })),
          },
        ]);

        await updateEmployeeRole(employeeId, newRoleId);
        break;

      case "View All Roles":
        const rolesToView = await getRoles();
        console.table(rolesToView);
        break;

      case "Add Role":
        const { roleName } = await inquirer.prompt([
          {
            type: "input",
            name: "roleName",
            message: "What is the name of the role?",
          },
        ]);

        const { salary } = await inquirer.prompt([
          {
            type: "number",
            name: "salary",
            message: "What is the salary of the role?",
          },
        ]);

        const departmentsToUpdate = await getDepartments();
        const { departmentId } = await inquirer.prompt([
          {
            type: "list",
            name: "departmentId",
            message: "Which department does this role belong to?",
            choices: departmentsToUpdate.map((department) => ({
              name: `${department.name}`,
              value: department.id,
            })),
          },
        ]);

        await addRole(roleName, salary, departmentId);
        break;
      case "View All Departments":
        const departmentsToView = await getDepartments();
        console.table(departmentsToView);
        break;
      case "Add Department":
        const { newDepartment } = await inquirer.prompt([
          {
            type: "input",
            name: "newDepartment",
            message: "What is the name of the department?",
          },
        ]);

        await addDepartment(newDepartment);
        break;
      case "Quit":
        process.exit(0);
        break;
    }
  }
}

async function getEmployees() {
  const result = await pool.query("SELECT * FROM employees");
  return result.rows;
}

async function addEmployee(firstName, lastName, roleId, managerId) {
  await pool.query(
    "INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)",
    [firstName, lastName, roleId, managerId]
  );
}

async function updateEmployeeRole(employeeId, newRoleId) {
  await pool.query("UPDATE employees SET role_id = $1 WHERE id = $2", [
    newRoleId,
    employeeId,
  ]);
}

async function getRoles() {
  const result = await pool.query("SELECT * FROM roles");
  return result.rows;
}

async function addRole(roleName, salary, departmentId) {
  try {
    const query =
      "INSERT INTO roles (title, salary, department_id) VALUES ($1, $2, $3)";
    const values = [roleName, salary, departmentId];

    await pool.query(query, values);
    console.log("Role added successfully");
  } catch (err) {
    console.error("Error executing query", err.stack);
  }
}

async function getDepartments() {
  const result = await pool.query("SELECT * FROM departments");
  return result.rows;
}

async function addDepartment(newDepartment) {
  try {
    const query = "INSERT INTO departments (name) VALUES ($1)";
    const values = [newDepartment];

    await pool.query(query, values);
    console.log(`Added ${newDepartment} to the database`);
  } catch (err) {
    console.error("Error executing query", err.stack);
  }
}

main();
