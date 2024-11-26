import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, X } from 'lucide-react';
import { User } from '../../types/user';
import Button from '../Button';
import { useState } from 'react';

const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

const userSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: passwordSchema.optional(),
  confirmPassword: z.string().optional(),
  role: z.enum(['admin', 'user']),
  expiresAt: z.string().min(1, 'Expiration date is required'),
  isActive: z.boolean(),
  maxSessions: z.number().min(1).max(10),
  department: z.string().min(1, 'Department is required'),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters'),
  permissions: z.array(z.string()),
}).refine((data) => {
  if (data.password || data.confirmPassword) {
    return data.password === data.confirmPassword;
  }
  return true;
}, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type UserFormData = z.infer<typeof userSchema>;

interface UserFormProps {
  user?: User | null;
  onClose: () => void;
  onSubmit: (data: UserFormData) => void;
}

const availablePermissions = [
  'manage_users',
  'view_analytics',
  'export_data',
  'manage_settings',
  'view_audit_logs'
];

const departments = [
  'Engineering',
  'HR',
  'Sales',
  'Marketing',
  'Operations',
  'Finance',
  'Management'
];

export default function UserForm({ user, onClose, onSubmit }: UserFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
    getValues,
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      email: user?.email || '',
      role: user?.role || 'user',
      expiresAt: user?.expiresAt ? new Date(user.expiresAt).toISOString().split('T')[0] : '',
      isActive: user?.isActive ?? true,
      maxSessions: user?.maxSessions || 1,
      department: user?.department || '',
      notes: user?.notes || '',
      permissions: user?.permissions || [],
    },
  });

  const password = watch('password');
  const selectedPermissions = watch('permissions') || [];

  const togglePermission = (permission: string) => {
    const current = getValues('permissions') || [];
    const updated = current.includes(permission)
      ? current.filter(p => p !== permission)
      : [...current, permission];
    setValue('permissions', updated);
  };

  const getPasswordStrength = (password: string): { strength: number; message: string } => {
    if (!password) return { strength: 0, message: 'No password' };
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    const messages = [
      'Very weak',
      'Weak',
      'Fair',
      'Good',
      'Strong',
      'Very strong'
    ];

    return { strength, message: messages[strength] };
  };

  const passwordStrength = password ? getPasswordStrength(password) : null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-dark-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            {user ? 'Edit User' : 'Add User'}
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            icon={<X className="w-5 h-5" />}
          />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <input
                type="email"
                id="email"
                {...register('email')}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-dark-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>
              )}
            </div>

            {/* Role Field */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Role
              </label>
              <select
                id="role"
                {...register('role')}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-dark-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {user ? 'New Password (leave blank to keep current)' : 'Password'}
              </label>
              <div className="relative mt-1">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  {...register('password', { required: !user })}
                  className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-dark-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-500"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password.message}</p>
              )}
              {passwordStrength && (
                <div className="mt-2">
                  <div className="flex items-center gap-2">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-1 w-full rounded-full ${
                          i < passwordStrength.strength
                            ? [
                                'bg-red-500',
                                'bg-orange-500',
                                'bg-yellow-500',
                                'bg-green-500',
                                'bg-emerald-500'
                              ][passwordStrength.strength - 1]
                            : 'bg-gray-200 dark:bg-gray-700'
                        }`}
                      />
                    ))}
                  </div>
                  <p className={`text-xs mt-1 ${
                    passwordStrength.strength <= 2 ? 'text-red-500' :
                    passwordStrength.strength <= 3 ? 'text-yellow-500' :
                    'text-green-500'
                  }`}>
                    {passwordStrength.message}
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            {(password || !user) && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Confirm Password
                </label>
                <div className="relative mt-1">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    {...register('confirmPassword', {
                      required: !!password,
                      validate: value => value === password || "Passwords don't match"
                    })}
                    className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-dark-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-500"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.confirmPassword.message}</p>
                )}
              </div>
            )}

            {/* Department Field */}
            <div>
              <label htmlFor="department" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Department
              </label>
              <select
                id="department"
                {...register('department')}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-dark-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="">Select Department</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
              {errors.department && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.department.message}</p>
              )}
            </div>

            {/* Max Sessions Field */}
            <div>
              <label htmlFor="maxSessions" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Max Concurrent Sessions
              </label>
              <input
                type="number"
                id="maxSessions"
                min="1"
                max="10"
                {...register('maxSessions', { valueAsNumber: true })}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-dark-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            {/* Expiration Date Field */}
            <div>
              <label htmlFor="expiresAt" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Account Expiration
              </label>
              <input
                type="date"
                id="expiresAt"
                {...register('expiresAt')}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-dark-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              {errors.expiresAt && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.expiresAt.message}</p>
              )}
            </div>
          </div>

          {/* Permissions Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Permissions
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {availablePermissions.map(permission => (
                <label key={permission} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedPermissions.includes(permission)}
                    onChange={() => togglePermission(permission)}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {permission.split('_').map(word => 
                      word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ')}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Notes Field */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Notes
            </label>
            <textarea
              id="notes"
              rows={3}
              {...register('notes')}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-dark-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Add any additional notes about this user..."
            />
            {errors.notes && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.notes.message}</p>
            )}
          </div>

          {/* Active Status */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              {...register('isActive')}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900 dark:text-gray-100">
              Active Account
            </label>
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : user ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}