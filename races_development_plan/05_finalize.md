# Step 5: Finalize and Test

This is the final step to ensure the "races" feature is complete and well-integrated.

**1. Add an Icon:**

If you haven't already, create or add an icon for the races feature.
*   Create an SVG icon component in `src/ui/components/icons/RaceIcon.svelte`. You can find a suitable icon from a library like `lucide.dev` and adapt it.
*   Update the `addRibbonIcon` call in `src/main.ts` to use your new icon.

**2. Internationalization (i18n):**

Make sure all new UI strings are using the `t()` helper function for translation.
*   Add the new keys (e.g., 'Races', 'Open races') to the localization files in `src/lang/`. You will likely find `ru.ts` and `en.ts`.

**3. Code Style and Linting:**

*   Run the linter to ensure the new code follows the project's code style.
    ```bash
    npm run lint
    ```
*   Fix any reported issues.

**4. Run Tests:**

*   Run the entire test suite to make sure your changes haven't broken any existing functionality.
    ```bash
    npm run test
    ```
*   If you added tests for the new DAOs, they should pass.

**5. Manual Test:**

*   Run the plugin in development mode in Obsidian (`npm run dev`).
*   Check the following:
    *   The ribbon icon for races appears and opens the races view.
    *   The "Open races" command works.
    *   The list of races is displayed correctly.
    *   The search bar filters the races.
    *   Clicking on a race opens the detail view for that race.
    *   The race details are displayed correctly.

**6. Create a Pull Request:**

Once all the steps are completed and verified, you can create a pull request to merge the new feature into the main branch. Make sure to reference this development plan in your pull request description.

You have now completed the implementation of the "races" feature. Congratulations!
