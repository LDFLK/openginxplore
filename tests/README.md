# Test Coverage


## Tests for view-profile
This test suite verifies the person profile functionality by accessing the profile through both the **View Profile** button on the home page and by directly navigating to the profile URL.

### Navigation via the View Profile button

1. Load the home page with all required mock data.
2. Navigate to the person's profile by clicking the **View Profile** button.
3. Verify that the profile data is displayed within the expected time.
4. Open the **Portfolios** tab, verify the person's history is loaded, and scroll through the component.
5. Verify that the **Qualifications** button loads the corresponding data successfully.
6. Verify that the **Share** button copies the profile link to the clipboard.
7. Verify that the **Back** button navigates the user back to the home page.

### Direct URL navigation

Repeat the same validation flow by navigating directly to the person's profile using the profile URL instead of the **View Profile** button.
