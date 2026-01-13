# Design Document: Channel Creation Enhancements

## Overview

This design document outlines the technical implementation for enhancing the channel creation functionality in the Awaz Pulse radio platform. The enhancements include expanding category options, implementing real-time frequency validation, adding flexible city selection, and streamlining the form for Pakistan-based operations.

## Architecture

The solution follows the existing Angular frontend and NestJS backend architecture:

- **Frontend**: Angular component with reactive forms and real-time validation
- **Backend**: NestJS service with enhanced validation and database constraints
- **Database**: Updated entity definitions and validation rules
- **API**: Enhanced endpoints with improved error handling

## Components and Interfaces

### Frontend Components

#### Enhanced Channel Form Component
- **Location**: `frontend/src/app/dashboards/station-owner-dashboard/station-owner-dashboard.component.ts`
- **Responsibilities**:
  - Render enhanced category dropdown with new options
  - Implement real-time frequency validation
  - Handle dynamic city selection with custom input
  - Provide comprehensive error messaging

#### Form Validation Service
- **Purpose**: Centralized validation logic for channel creation
- **Key Methods**:
  - `validateFrequencyUnique(frequency: string): Observable<ValidationResult>`
  - `validateCityInput(city: string, isCustom: boolean): ValidationResult`
  - `formatValidationErrors(errors: ValidationError[]): string[]`

### Backend Components

#### Enhanced Channels Service
- **Location**: `backend/src/channels/channels.service.ts`
- **New Methods**:
  - `checkFrequencyUnique(frequency: string): Promise<boolean>`
  - `getConflictingChannel(frequency: string): Promise<Channel | null>`
  - Enhanced `create()` method with improved validation

#### Updated Channel Entity
- **Location**: `backend/src/entities/channel.entity.ts`
- **Changes**:
  - Expanded `ChannelCategory` enum
  - Enhanced frequency validation constraints
  - Updated city field to support custom values

#### Enhanced DTO
- **Location**: `backend/src/channels/dto/create-channel.dto.ts`
- **Updates**:
  - New category validation
  - Custom frequency validation decorator
  - Conditional city validation

## Data Models

### Updated Channel Category Enum
```typescript
export enum ChannelCategory {
  MUSIC = 'music',
  NEWS = 'news',
  TALK = 'talk',
  SPORTS = 'sports',
  RELIGIOUS = 'religious',
  EDUCATIONAL = 'educational',
  ENTERTAINMENT = 'entertainment',
  PODCASTS = 'podcasts',
  MIXED = 'mixed',
  LOCAL_CHANNEL = 'local_channel'
}
```

### Enhanced Channel Entity
```typescript
@Entity('channels')
export class Channel {
  // ... existing fields ...
  
  @Column({ unique: true })
  @Index('idx_channel_frequency')
  frequency: string;
  
  @Column({
    type: 'simple-enum',
    enum: ChannelCategory,
    default: ChannelCategory.MUSIC
  })
  category: ChannelCategory;
  
  @Column()
  city: string; // Now supports custom city names
  
  @Column({ default: 'Pakistan' })
  country: string; // Auto-set to Pakistan
}
```

### Form Data Interface
```typescript
interface ChannelFormData {
  name: string;
  callSign: string;
  frequency: string;
  category: ChannelCategory;
  city: string;
  customCity?: string;
  description?: string;
  // country removed from user input
}
```

## Implementation Details

### Frontend Form Enhancements

#### Improved Form Layout
```typescript
// Enhanced form layout with optimized field positioning
<div class="form-row">
  <div class="col-md-6">
    <!-- Language field -->
    <div class="form-group">
      <label>Language *</label>
      <select formControlName="language" class="form-control">
        <!-- language options -->
      </select>
    </div>
  </div>
  <div class="col-md-6">
    <!-- City field moved to right side -->
    <div class="form-group">
      <label>City *</label>
      <select formControlName="city" class="form-control">
        <!-- city options including "Other City" -->
      </select>
    </div>
  </div>
</div>
```

#### Success Message Implementation
```typescript
// Professional SweetAlert success message
async showSuccessMessage(channelName: string): Promise<void> {
  await Swal.fire({
    title: 'Congratulations!',
    html: `
      <div class="success-content">
        <i class="fas fa-radio success-icon"></i>
        <p>Your channel <strong>"${channelName}"</strong> has been created successfully!</p>
        <p class="next-steps">You can now start broadcasting and manage your channel from the dashboard.</p>
      </div>
    `,
    icon: 'success',
    confirmButtonText: 'Go to Dashboard',
    confirmButtonColor: '#28a745',
    customClass: {
      popup: 'channel-success-popup',
      title: 'success-title',
      htmlContainer: 'success-html'
    },
    showClass: {
      popup: 'animate__animated animate__fadeInUp'
    }
  });
}
```

#### Category Dropdown Enhancement
```typescript
// Updated categories array
stationInfo = {
  // ... existing properties ...
  categories: [
    'Music', 'News', 'Talk', 'Sports', 'Religious', 
    'Educational', 'Entertainment', 'Podcasts', 'Mixed', 'Local Channel'
  ]
};
```

#### Real-time Frequency Validation
```typescript
// Add frequency validation with debouncing
this.channelForm.get('frequency')?.valueChanges
  .pipe(
    debounceTime(500),
    distinctUntilChanged(),
    switchMap(frequency => this.validateFrequency(frequency))
  )
  .subscribe(result => {
    this.handleFrequencyValidation(result);
  });
```

#### Dynamic City Selection
```typescript
// Enhanced city selection with custom input
onCityChange(selectedCity: string): void {
  this.showCustomCityInput = selectedCity === 'Other';
  if (!this.showCustomCityInput) {
    this.channelForm.patchValue({ customCity: '' });
  }
}
```

### Backend Validation Enhancements

#### Frequency Uniqueness Check
```typescript
async checkFrequencyUnique(frequency: string): Promise<boolean> {
  const existingChannel = await this.channelRepository.findOne({
    where: { frequency }
  });
  return !existingChannel;
}

async getConflictingChannel(frequency: string): Promise<Channel | null> {
  return this.channelRepository.findOne({
    where: { frequency },
    select: ['name', 'callSign', 'frequency']
  });
}
```

#### Enhanced Create Method
```typescript
async create(createChannelDto: CreateChannelDto, ownerId: string): Promise<Channel> {
  // Existing validations...
  
  // Check frequency uniqueness
  const isFrequencyUnique = await this.checkFrequencyUnique(createChannelDto.frequency);
  if (!isFrequencyUnique) {
    const conflictingChannel = await this.getConflictingChannel(createChannelDto.frequency);
    throw new ConflictException(
      `Frequency ${createChannelDto.frequency} MHz is already in use by ${conflictingChannel?.name} (${conflictingChannel?.callSign})`
    );
  }
  
  // Auto-set country to Pakistan
  const channelData = {
    ...createChannelDto,
    country: 'Pakistan',
    city: createChannelDto.customCity || createChannelDto.city
  };
  
  // ... rest of creation logic
}
```

### API Endpoint Enhancements

#### Frequency Validation Endpoint
```typescript
@Get('validate-frequency/:frequency')
async validateFrequency(@Param('frequency') frequency: string) {
  const isUnique = await this.channelsService.checkFrequencyUnique(frequency);
  const conflictingChannel = isUnique ? null : await this.channelsService.getConflictingChannel(frequency);
  
  return {
    isUnique,
    conflictingChannel,
    message: isUnique ? 'Frequency is available' : `Frequency already in use by ${conflictingChannel?.name}`
  };
}
```

## Error Handling

### Frontend Error Display
- Real-time validation errors displayed inline with form fields
- Comprehensive error messages with specific guidance
- Visual indicators for validation states (success, error, pending)
- Form submission prevention when validation errors exist

### Backend Error Responses
- Structured error responses with specific error codes
- Detailed conflict information for frequency duplicates
- Validation error aggregation for multiple field issues
- Consistent error message formatting

### Error Message Examples
```typescript
const errorMessages = {
  frequencyConflict: 'Frequency {frequency} MHz is already in use by {channelName} ({callSign})',
  frequencyRequired: 'Broadcasting frequency is required',
  frequencyFormat: 'Frequency must be in valid MHz format (e.g., 101.0)',
  categoryRequired: 'Channel category must be selected',
  cityRequired: 'City selection is required',
  customCityRequired: 'Custom city name is required when "Other City" is selected',
  customCityInvalid: 'City name must contain only letters, spaces, and hyphens'
};
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Category Selection Acceptance
*For any* valid channel category (including new categories Podcasts, Mixed, and Local Channel), when selected by a station owner, the system should accept the selection and include it in the channel creation request.
**Validates: Requirements 1.2**

### Property 2: Legacy Category Compatibility
*For any* existing channel category (Music, News, Talk, Sports, Religious, Educational, Entertainment), the system should continue to accept and process the category selection without errors.
**Validates: Requirements 1.3**

### Property 3: Frequency Uniqueness Validation
*For any* frequency input, when a station owner enters it, the system should validate that the frequency is not already in use by another channel and respond appropriately.
**Validates: Requirements 2.1**

### Property 4: Form Submission Prevention
*For any* channel creation form with validation errors (including frequency conflicts), the system should prevent form submission until all errors are resolved.
**Validates: Requirements 2.3**

### Property 5: Custom City Validation
*For any* custom city name input, when "Other City" is selected, the system should validate that the input is not empty and contains only valid characters (letters, spaces, hyphens).
**Validates: Requirements 3.3**

### Property 6: Custom City Storage
*For any* valid custom city name, when "Other City" is selected and a channel is created, the system should save the custom city name correctly in the database.
**Validates: Requirements 3.5**

### Property 7: Automatic Country Assignment
*For any* new channel creation, the system should automatically set the country value to "Pakistan" without requiring user input.
**Validates: Requirements 4.2, 4.3**

### Property 8: Validation Error Display
*For any* validation error that occurs, the system should display specific error messages near the relevant form field with clear guidance.
**Validates: Requirements 5.1**

### Property 9: Multiple Error Handling
*For any* form state with multiple validation errors, the system should display all relevant error messages simultaneously without hiding any errors.
**Validates: Requirements 5.2**

### Property 10: Form Submission Blocking
*For any* form state containing validation errors, the system should prevent form submission and clearly indicate which fields need attention.
**Validates: Requirements 5.4**

### Property 11: Server Error Message Quality
*For any* server-side validation failure, the system should display user-friendly error messages that explain the specific issue and provide suggested resolution steps.
**Validates: Requirements 5.5**

### Property 12: Form Layout Optimization
*For any* screen size above mobile breakpoint, the city field should be positioned on the right side next to the language field to optimize space utilization.
**Validates: Requirements 6.1, 6.2**

### Property 13: Success Message Display
*For any* successful channel creation, the system should display a professional SweetAlert congratulations message with the channel name and clear next steps.
**Validates: Requirements 6.3, 6.4**

## Testing Strategy

### Dual Testing Approach
The implementation will use both unit tests and property-based tests to ensure comprehensive coverage:

- **Unit tests**: Verify specific examples, edge cases, and error conditions
- **Property tests**: Verify universal properties across all inputs
- Both approaches are complementary and necessary for complete validation

### Unit Testing Focus
Unit tests will concentrate on:
- Specific UI interactions (dropdown selections, form field visibility)
- Integration points between frontend and backend
- Edge cases for validation logic
- Error message formatting and display

### Property-Based Testing Configuration
- Minimum 100 iterations per property test
- Each property test references its design document property
- Tag format: **Feature: channel-creation-enhancements, Property {number}: {property_text}**
- Tests will use Angular Testing Library for frontend components
- Backend tests will use Jest with NestJS testing utilities

### Testing Libraries
- **Frontend**: Angular Testing Library, Jest, RxJS Testing
- **Backend**: Jest, Supertest, TypeORM testing utilities
- **Property Testing**: fast-check for JavaScript/TypeScript property-based testing

### Test Data Generation
Smart generators will be created for:
- Valid and invalid frequency formats
- Channel category combinations
- City name variations (predefined and custom)
- Form validation scenarios
- Error message content validation

The testing strategy ensures that both specific examples work correctly and that universal properties hold across all possible inputs, providing confidence in the system's correctness and reliability.