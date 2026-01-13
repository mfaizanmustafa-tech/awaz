# Requirements Document

## Introduction

This specification defines enhancements to the station owner channel creation functionality in the Awaz Pulse radio platform. The enhancements focus on improving category options, implementing frequency validation, enhancing city selection, and streamlining the form for Pakistan-based operations.

## Glossary

- **Channel**: A radio broadcasting station with unique frequency and call sign
- **Station_Owner**: User with permission to create and manage radio channels
- **Frequency**: Broadcasting frequency in MHz that must be unique across all channels
- **Call_Sign**: Unique identifier for a radio channel (e.g., FM101)
- **Category**: Classification of channel content type
- **City_Selector**: UI component for selecting broadcasting city location

## Requirements

### Requirement 1: Enhanced Channel Categories

**User Story:** As a station owner, I want access to additional channel categories including Podcasts, Mixed, and Local Channel, so that I can better classify my channel's content type.

#### Acceptance Criteria

1. WHEN a station owner views the category dropdown, THE System SHALL display all existing categories plus Podcasts, Mixed, and Local Channel options
2. WHEN a station owner selects any category, THE System SHALL accept the selection and include it in the channel creation request
3. THE System SHALL maintain backward compatibility with existing channel categories (Music, News, Talk, Sports, Religious, Educational, Entertainment)

### Requirement 2: Unique Frequency Validation

**User Story:** As a station owner, I want the system to prevent duplicate frequencies, so that each channel has a unique broadcasting frequency without conflicts.

#### Acceptance Criteria

1. WHEN a station owner enters a frequency, THE System SHALL validate that the frequency is not already in use by another channel
2. IF a frequency is already in use, THEN THE System SHALL display a clear error message indicating the frequency conflict
3. WHEN a frequency validation fails, THE System SHALL prevent form submission until a unique frequency is provided
4. THE System SHALL perform frequency validation in real-time as the user types or when the field loses focus
5. THE System SHALL display the conflicting channel information (name and call sign) when a duplicate frequency is detected

### Requirement 3: Enhanced City Selection

**User Story:** As a station owner, I want an "Other City" option with custom input capability, so that I can specify my broadcasting location even if it's not in the predefined list.

#### Acceptance Criteria

1. WHEN a station owner views the city dropdown, THE System SHALL display all existing cities plus an "Other City" option
2. WHEN a station owner selects "Other City", THE System SHALL display a text input field for custom city name entry
3. WHEN a station owner enters a custom city name, THE System SHALL validate that the input is not empty and contains only valid characters
4. WHEN a station owner switches from "Other City" back to a predefined city, THE System SHALL hide the custom input field and clear any entered custom city name
5. THE System SHALL save the custom city name when "Other City" is selected and a valid custom name is provided

### Requirement 4: Country Field Removal

**User Story:** As a system administrator, I want to remove the country selection requirement, so that the form is streamlined for Pakistan-based operations without unnecessary fields.

#### Acceptance Criteria

1. THE System SHALL not display a country input field in the channel creation form
2. THE System SHALL automatically set the country value to "Pakistan" for all new channels
3. WHEN a channel is created, THE System SHALL include "Pakistan" as the country value in the backend without user input
4. THE System SHALL maintain existing channel data integrity for channels created before this change

### Requirement 5: Enhanced Error Handling

**User Story:** As a station owner, I want clear and specific error messages for validation failures, so that I can quickly understand and resolve any issues with my channel creation.

#### Acceptance Criteria

1. WHEN any validation error occurs, THE System SHALL display specific error messages near the relevant form field
2. WHEN multiple validation errors exist, THE System SHALL display all relevant error messages simultaneously
3. WHEN a validation error is resolved, THE System SHALL immediately remove the corresponding error message
4. THE System SHALL prevent form submission when any validation errors exist and clearly indicate which fields need attention
5. WHEN server-side validation fails, THE System SHALL display user-friendly error messages that explain the specific issue and suggested resolution

### Requirement 6: Improved Form Layout and User Experience

**User Story:** As a station owner, I want an optimized form layout and professional success feedback, so that I have a better user experience when creating channels.

#### Acceptance Criteria

1. WHEN viewing the channel creation form, THE System SHALL display the city field on the right side next to the language field to utilize available space efficiently
2. WHEN the form layout is rendered, THE System SHALL maintain proper responsive design and field alignment across different screen sizes
3. WHEN a channel is successfully created, THE System SHALL display a professional SweetAlert congratulations message
4. WHEN the success message is shown, THE System SHALL include the channel name and provide clear next steps or options
5. THE System SHALL ensure the success message is visually appealing and consistent with the application's design theme