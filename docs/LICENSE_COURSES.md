# License Courses System

This document explains the license courses system that manages coach and judge certification courses for ICA and ICU organizations.

## 📋 Overview

The license courses system provides:
- **Course Management**: Store and manage various certification courses
- **Organization Support**: Separate courses for ICA and ICU
- **Type Classification**: Coach, Judge, and Rules courses
- **Module System**: Support for modular course structures
- **Admin Controls**: Full CRUD operations for administrators

## 🗃️ Database Schema

### Table: `license_courses`

```sql
CREATE TABLE license_courses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    course_name VARCHAR(255) NOT NULL,
    course_type VARCHAR(50) NOT NULL CHECK (course_type IN ('coach', 'judge', 'rules')),
    level VARCHAR(50),
    organization VARCHAR(10) NOT NULL CHECK (organization IN ('ICA', 'ICU')),
    module VARCHAR(50),
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### View: `active_license_courses`
- Filters only active courses
- Sorted by sort_order and course_name

## 🔐 Security (RLS Policies)

1. **Public Read**: Anyone can view active courses
2. **Authenticated Read**: Authenticated users can view all courses
3. **Admin Management**: Only admins can create, update, and delete courses

## 📝 Course Types

### ICA Courses
- **ICA Coach Course Level 1**: Basic coaching certification
- **ICA Coach Course Level 2**: Advanced coaching certification
- **ICA Judge Course Level 1**: Basic judging certification
- **ICA Judge Course Level 2**: Advanced judging certification

### ICU Courses
#### Rules Comprehension
- **ICU Cheerleading Rules Comprehension Module A/B/C**
- **ICU Performance Cheer Rules Comprehension Module A/B/C**

#### Judge Certification
- **ICU Cheerleading Judge Course Module A/B/C**

## 🚀 Installation & Setup

### 1. Run SQL Script
Execute the SQL script in your Supabase database:
```bash
# In Supabase SQL Editor, run:
scripts/create-license-courses-table.sql
```

### 2. Redux Integration
The system is already integrated with Redux store:
```typescript
// Store includes licenseCourses reducer
import licenseCoursesReducer from "@/features/license-courses/licenseCoursesSlice"

// Auto-loaded in auth-init.tsx
dispatch(fetchLicenseCourses(true))
```

### 3. TypeScript Types
All types are defined in:
```typescript
// types/license-courses.ts
interface LicenseCourse {
  id: string
  course_name: string
  course_type: 'coach' | 'judge' | 'rules'
  level?: string
  organization: 'ICA' | 'ICU'
  module?: string
  description?: string
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}
```

## 🎯 Usage Examples

### Basic Component Usage
```tsx
import { LicenseCoursesList } from "@/components/license-courses/license-courses-list"

// Show all courses with tabs
<LicenseCoursesList />

// Show only ICA courses
<LicenseCoursesList filterByOrganization="ICA" />

// Show only coach courses
<LicenseCoursesList filterByType="coach" />

// Show admin actions
<LicenseCoursesList showAdminActions={true} />
```

### Redux Hooks Usage
```tsx
import { useAppSelector, useAppDispatch } from "@/lib/redux/hooks"
import {
  selectAllLicenseCourses,
  selectCoachCourses,
  selectJudgeCourses,
  fetchLicenseCourses
} from "@/features/license-courses/licenseCoursesSlice"

function MyComponent() {
  const dispatch = useAppDispatch()
  const allCourses = useAppSelector(selectAllLicenseCourses)
  const coachCourses = useAppSelector(selectCoachCourses)
  
  // Fetch courses
  useEffect(() => {
    dispatch(fetchLicenseCourses(true)) // active only
  }, [dispatch])
  
  return (
    <div>
      <h2>Total Courses: {allCourses.length}</h2>
      <h3>Coach Courses: {coachCourses.length}</h3>
    </div>
  )
}
```

### Admin Operations
```tsx
import {
  createLicenseCourse,
  updateLicenseCourse,
  deleteLicenseCourse
} from "@/features/license-courses/licenseCoursesSlice"

// Create new course
dispatch(createLicenseCourse({
  course_name: "New Course",
  course_type: "coach",
  organization: "ICA",
  level: "Level 1",
  description: "Course description"
}))

// Update course
dispatch(updateLicenseCourse({
  id: "course-id",
  course_name: "Updated Name",
  description: "Updated description"
}))

// Soft delete (deactivate)
dispatch(deleteLicenseCourse("course-id"))
```

## 📊 Available Selectors

```typescript
// Get all courses
selectAllLicenseCourses(state)

// Filter by type
selectCoachCourses(state)
selectJudgeCourses(state) 
selectRulesCourses(state)

// Filter by organization
selectLicenseCoursesByOrganization(state, 'ICA')
selectLicenseCoursesByOrganization(state, 'ICU')

// Filter by custom type
selectLicenseCoursesByType(state, 'coach')

// Loading and error states
selectLicenseCoursesLoading(state)
selectLicenseCoursesError(state)
```

## 🔧 API Operations

### Fetch Courses
```typescript
// Fetch active courses only
dispatch(fetchLicenseCourses(true))

// Fetch all courses (including inactive)
dispatch(fetchLicenseCourses(false))

// Fetch by criteria
dispatch(fetchLicenseCoursesByType({ 
  type: 'coach', 
  organization: 'ICA' 
}))
```

### CRUD Operations
```typescript
// Create
dispatch(createLicenseCourse(courseData))

// Update
dispatch(updateLicenseCourse({ id, ...updateData }))

// Delete (soft delete)
dispatch(deleteLicenseCourse(courseId))
```

## 🎨 UI Components

### LicenseCoursesList Component Features:
- **Tabbed Interface**: All, Coach, Judge, Rules, By Organization
- **Statistics Cards**: Course counts by type
- **Filtering**: By organization and type
- **Admin Actions**: Edit and deactivate buttons
- **Responsive Design**: Works on mobile and desktop
- **Loading States**: Spinner and error handling

### Component Props:
```typescript
interface LicenseCoursesListProps {
  showAdminActions?: boolean      // Show edit/delete buttons
  filterByOrganization?: 'ICA' | 'ICU'  // Filter by org
  filterByType?: 'coach' | 'judge' | 'rules'  // Filter by type
}
```

## 🔄 Data Flow

1. **App Init**: `auth-init.tsx` automatically fetches courses
2. **Redux Store**: Courses stored in `licenseCourses` slice
3. **Components**: Use selectors to access filtered data
4. **Admin Actions**: Dispatch CRUD operations
5. **Real-time**: Changes reflect immediately in UI

## 📱 Integration Examples

### In Education Page
```tsx
// Show only ICA courses
<LicenseCoursesList filterByOrganization="ICA" />
```

### In Admin Dashboard
```tsx
// Show all courses with admin controls
<LicenseCoursesList showAdminActions={true} />
```

### In Profile/Certifications
```tsx
// Show user's completed courses
<UserCertifications userId={user.id} />
```

## 🛠️ Customization

### Adding New Course Types
1. Update database constraint:
```sql
ALTER TABLE license_courses 
DROP CONSTRAINT license_courses_course_type_check;

ALTER TABLE license_courses 
ADD CONSTRAINT license_courses_course_type_check 
CHECK (course_type IN ('coach', 'judge', 'rules', 'new_type'));
```

2. Update TypeScript types:
```typescript
// In types/license-courses.ts
course_type: 'coach' | 'judge' | 'rules' | 'new_type'
```

3. Add new selector:
```typescript
// In licenseCoursesSlice.ts
export const selectNewTypeCourses = (state: { licenseCourses: LicenseCoursesState }) =>
  state.licenseCourses.courses.filter(course => course.course_type === 'new_type')
```

### Adding New Organizations
Similar process for organizations (ICA, ICU, NEW_ORG).

## 🧪 Testing

The system includes comprehensive error handling:
- **Network Errors**: Graceful fallbacks
- **Loading States**: Proper UI feedback  
- **Empty States**: User-friendly messages
- **Validation**: Type-safe operations

## 📈 Performance

- **Auto-loading**: Courses pre-fetched on app start
- **Memoized Selectors**: Efficient filtering
- **Lazy Loading**: Components load data when needed
- **Caching**: Redux store prevents unnecessary requests

## 🔮 Future Enhancements

1. **User Progress Tracking**: Track course completion
2. **Certification Management**: Issue digital certificates
3. **Prerequisites**: Course dependency system
4. **Scheduling**: Course session management
5. **Payments**: Integration with payment system
6. **Reporting**: Analytics and progress reports

---

This system provides a solid foundation for managing certification courses and can be easily extended based on your specific requirements.
