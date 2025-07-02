import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authService } from '../../services/auth.service';
import { User } from '../../types/user.types';

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  registrationStep: 'email' | 'username' | 'interests' | 'completed';
  emailVerified: boolean;
  twoFactorRequired: boolean;
  karma: number;
  permissions: {
    canPost: boolean;
    canComment: boolean;
    canCreateRepository: boolean;
    canUploadCSV: boolean;
    canAccessAPI: boolean;
    isGoldenCurator: boolean;
    isModerator: boolean;
  };
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  refreshToken: localStorage.getItem('refreshToken'),
  isAuthenticated: false,
  isLoading: false,
  error: null,
  registrationStep: 'email',
  emailVerified: false,
  twoFactorRequired: false,
  karma: 0,
  permissions: {
    canPost: false,
    canComment: false,
    canCreateRepository: false,
    canUploadCSV: false,
    canAccessAPI: false,
    isGoldenCurator: false,
    isModerator: false,
  },
};

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }) => {
    const response = await authService.login(credentials);
    return response;
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (userData: { email: string; password: string; username?: string; interests?: string[] }) => {
    const response = await authService.register(userData);
    return response;
  }
);

export const verifyEmail = createAsyncThunk(
  'auth/verifyEmail',
  async (verificationToken: string) => {
    const response = await authService.verifyEmail(verificationToken);
    return response;
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  await authService.logout();
});

export const refreshAccessToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { getState }) => {
    const state = getState() as { auth: AuthState };
    const response = await authService.refreshToken(state.auth.refreshToken!);
    return response;
  }
);

export const fetchCurrentUser = createAsyncThunk('auth/fetchCurrentUser', async () => {
  const response = await authService.getCurrentUser();
  return response;
});

export const updateUserProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData: Partial<User>) => {
    const response = await authService.updateProfile(profileData);
    return response;
  }
);

export const verify2FA = createAsyncThunk(
  'auth/verify2FA',
  async (code: string) => {
    const response = await authService.verify2FA(code);
    return response;
  }
);

export const requestPasswordReset = createAsyncThunk(
  'auth/requestPasswordReset',
  async (email: string) => {
    const response = await authService.requestPasswordReset(email);
    return response;
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async (data: { token: string; newPassword: string }) => {
    const response = await authService.resetPassword(data);
    return response;
  }
);

export const updateKarma = createAsyncThunk(
  'auth/updateKarma',
  async (karmaChange: number) => {
    const response = await authService.updateKarma(karmaChange);
    return response;
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string; refreshToken: string }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
      state.karma = action.payload.user.karma || 0;
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('refreshToken', action.payload.refreshToken);
      state.permissions = calculatePermissions(action.payload.user.karma || 0, action.payload.user.role);
    },
    clearCredentials: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.karma = 0;
      state.permissions = initialState.permissions;
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    },
    setRegistrationStep: (state, action: PayloadAction<AuthState['registrationStep']>) => {
      state.registrationStep = action.payload;
    },
    setTwoFactorRequired: (state, action: PayloadAction<boolean>) => {
      state.twoFactorRequired = action.payload;
    },
    updateUserKarma: (state, action: PayloadAction<number>) => {
      state.karma = action.payload;
      if (state.user) {
        state.user.karma = action.payload;
      }
      state.permissions = calculatePermissions(action.payload, state.user?.role);
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
        state.karma = action.payload.user.karma || 0;
        state.emailVerified = action.payload.user.emailVerified;
        state.twoFactorRequired = action.payload.twoFactorRequired || false;
        state.permissions = calculatePermissions(action.payload.user.karma || 0, action.payload.user.role);
        if (!action.payload.twoFactorRequired) {
          localStorage.setItem('token', action.payload.token);
          localStorage.setItem('refreshToken', action.payload.refreshToken);
        }
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Login failed';
      })
      // Register
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.registrationStep) {
          state.registrationStep = action.payload.registrationStep;
        }
        if (action.payload.user) {
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.refreshToken = action.payload.refreshToken;
          state.isAuthenticated = true;
          localStorage.setItem('token', action.payload.token);
          localStorage.setItem('refreshToken', action.payload.refreshToken);
        }
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Registration failed';
      })
      // Verify Email
      .addCase(verifyEmail.fulfilled, (state) => {
        state.emailVerified = true;
        if (state.user) {
          state.user.emailVerified = true;
        }
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.karma = 0;
        state.permissions = initialState.permissions;
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
      })
      // Fetch Current User
      .addCase(fetchCurrentUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.karma = action.payload.karma || 0;
        state.emailVerified = action.payload.emailVerified;
        state.permissions = calculatePermissions(action.payload.karma || 0, action.payload.role);
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
      })
      // Update Profile
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.user = { ...state.user, ...action.payload };
      })
      // 2FA Verification
      .addCase(verify2FA.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.twoFactorRequired = false;
        localStorage.setItem('token', action.payload.token);
        localStorage.setItem('refreshToken', action.payload.refreshToken);
      })
      // Update Karma
      .addCase(updateKarma.fulfilled, (state, action) => {
        state.karma = action.payload.karma;
        if (state.user) {
          state.user.karma = action.payload.karma;
        }
        state.permissions = calculatePermissions(action.payload.karma, state.user?.role);
      })
      // Refresh Token
      .addCase(refreshAccessToken.fulfilled, (state, action) => {
        state.token = action.payload.token;
        localStorage.setItem('token', action.payload.token);
      });
  },
});

function calculatePermissions(karma: number, role?: string): AuthState['permissions'] {
  return {
    canPost: karma >= 0,
    canComment: karma >= 0,
    canCreateRepository: karma >= 500,
    canUploadCSV: karma >= 100,
    canAccessAPI: karma >= 1000,
    isGoldenCurator: karma >= 5000,
    isModerator: role === 'moderator' || role === 'admin',
  };
}

export const {
  setCredentials,
  clearCredentials,
  setRegistrationStep,
  setTwoFactorRequired,
  updateUserKarma,
  clearError,
} = authSlice.actions;

export default authSlice.reducer;