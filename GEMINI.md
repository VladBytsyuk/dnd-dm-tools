# DnD DM Tools Obsidian Plugin

This document provides a summary of the DnD DM Tools Obsidian plugin project, intended to be used as a context for AI-powered development assistance.

## Project Overview

This project is an [Obsidian](https://obsidian.md/) plugin that provides a set of tools for Dungeon Masters of Dungeons & Dragons 5th Edition. The plugin is written in Russian and includes the following features:

*   **Bestiary:** Allows users to add, view, and modify creature statblocks.
*   **Spellbook:** Allows users to add, view, and modify spell cards.
*   **Initiative Tracker:** A tool for tracking combat encounters.
*   **DM Screen:** A side panel that provides a quick reference to various D&D 5e rules and information.

The plugin is built with [TypeScript](https://www.typescriptlang.org/) and [Svelte](https://svelte.dev/) for the user interface. It uses [sql.js](https://sql.js.org/) to manage a local database for storing and querying data.

## Building and Running

The project is built and bundled using [esbuild](https://esbuild.github.io/). The following npm scripts are available for building and running the plugin:

*   **`npm run dev`**: Builds the plugin in development mode and watches for changes.
*   **`npm run build`**: Builds the plugin for production.
*   **`npm run test`**: Runs the test suite using [vitest](https://vitest.dev/).
*   **`npm run test:cov`**: Runs the test suite and generates a coverage report.

To get started with development, you will need to have [Node.js](https://nodejs.org/) and [npm](https://www.npmjs.com/) installed. Then, follow these steps:

1.  Clone the repository.
2.  Install the dependencies: `npm install`
3.  Run the development server: `npm run dev`
4.  Copy the generated `main.js`, `manifest.json`, and `styles.css` files into the `.obsidian/plugins/dnd-dm-tools` directory of your Obsidian vault.

## Development Conventions

*   **Language:** The project is written in TypeScript.
*   **UI Framework:** The user interface is built with Svelte.
*   **Testing:** The project uses vitest for testing. Tests are located in the `test` directory and follow a similar structure to the `src` directory.
*   **Code Style:** The project uses ESLint to enforce a consistent code style. You can run `npm run lint` to check for linting errors.
*   **Architecture:** The plugin is organized into modules, with each feature (Bestiary, Spellbook, etc.) having its own dedicated directory. The main plugin class, `DndStatblockPlugin`, is responsible for initializing and managing these features.
*   **Database:** The plugin uses `sql.js` to manage a local database. The database schema and DAOs are located in the `src/data/database` directory.
