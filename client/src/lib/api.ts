// API utility functions for making requests to the backend

import { apiRequest } from "./queryClient";

// Generic API functions to reuse across the application

// GET request with proper typing
export async function fetchData<T>(endpoint: string): Promise<T> {
  const response = await apiRequest("GET", endpoint);
  return response.json();
}

// POST request with proper typing
export async function createData<T, R>(endpoint: string, data: T): Promise<R> {
  const response = await apiRequest("POST", endpoint, data);
  return response.json();
}

// PATCH request with proper typing
export async function updateData<T, R>(endpoint: string, data: T): Promise<R> {
  const response = await apiRequest("PATCH", endpoint, data);
  return response.json();
}

// DELETE request
export async function deleteData(endpoint: string): Promise<void> {
  await apiRequest("DELETE", endpoint);
}

// Authentication functions
export const authApi = {
  login: async (username: string, password: string) => {
    const response = await apiRequest("POST", "/api/auth/login", { username, password });
    return response.json();
  },
  
  logout: async () => {
    await apiRequest("POST", "/api/auth/logout");
  },
  
  getCurrentUser: async () => {
    const response = await apiRequest("GET", "/api/auth/user");
    return response.json();
  }
};

// User and patient related functions
export const userApi = {
  updateUser: async (id: number, data: any) => {
    const response = await apiRequest("PATCH", `/api/users/${id}`, data);
    return response.json();
  },
  
  getUserProfile: async () => {
    const response = await apiRequest("GET", "/api/users/profile");
    return response.json();
  },
  
  updatePatient: async (id: number, data: any) => {
    // Remove undefined or empty string values before sending
    const cleanedData = Object.fromEntries(
      Object.entries(data).filter(([_, value]) => value !== undefined && value !== "")
    );
    
    console.log('Updating patient with data:', cleanedData);
    const response = await apiRequest("PATCH", `/api/patients/${id}`, cleanedData);
    return response.json();
  },
  
  downloadPatientData: async () => {
    try {
      // First try a normal approach with our API function which adds auth headers
      const response = await fetch("/api/patients/download-data", {
        method: "GET",
        headers: {
          // Add localStorage auth headers if available
          ...(localStorage.getItem('saphenus_auth') ? (() => {
            const auth = JSON.parse(localStorage.getItem('saphenus_auth') || '{}');
            return {
              'X-User-ID': String(auth.userId || 1),
              'X-User-Role': auth.role || 'patient'
            };
          })() : {})
        },
        credentials: "include"
      });
      
      if (!response.ok) {
        throw new Error(`Download failed: ${response.status} ${response.statusText}`);
      }
      
      // Extract the filename from Content-Disposition header if available
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'patient_data.csv';
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }
      
      // Convert response to blob
      const blob = await response.blob();
      
      // Create a URL for the blob and trigger download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      return true;
    } catch (error) {
      console.error("Error downloading patient data:", error);
      throw error;
    }
  },
  
  getDoctors: async () => {
    const response = await apiRequest("GET", "/api/doctors");
    return response.json();
  }
};

// Appointments
import { Appointment, InsertAppointment } from "@shared/schema";

export const appointmentsApi = {
  getPatientAppointments: async (patientId: number) => {
    const response = await apiRequest("GET", `/api/appointments/patient/${patientId}`);
    return response.json();
  },
  
  createAppointment: async (data: any) => {
    // Format data properly before sending to API
    const apiData = {
      ...data,
      dateTime: data.dateTime instanceof Date 
        ? data.dateTime.toISOString() 
        : data.dateTime,
    };
    
    console.log('Creating appointment with API call data:', apiData);
    const response = await apiRequest("POST", "/api/appointments", apiData);
    return response.json() as Promise<Appointment>;
  },
  
  updateAppointment: async (id: number, data: any) => {
    // Format data properly before sending to API
    const apiData = {
      ...data,
      dateTime: data.dateTime instanceof Date 
        ? data.dateTime.toISOString() 
        : data.dateTime,
    };
    
    console.log('Updating appointment with API call data:', { id, data: apiData });
    const response = await apiRequest("PATCH", `/api/appointments/${id}`, apiData);
    return response.json() as Promise<Appointment>;
  },
  
  deleteAppointment: async (id: number) => {
    console.log('Deleting appointment with ID:', id);
    await apiRequest("DELETE", `/api/appointments/${id}`);
  }
};

// Health metrics
export const metricsApi = {
  getPatientHealthMetrics: async (patientId: number) => {
    const response = await apiRequest("GET", `/api/health-metrics/patient/${patientId}`);
    return response.json();
  },
  
  getLatestPatientHealthMetrics: async (patientId: number) => {
    const response = await apiRequest("GET", `/api/health-metrics/patient/${patientId}/latest`);
    return response.json();
  },
  
  createHealthMetric: async (data: any) => {
    const response = await apiRequest("POST", "/api/health-metrics", data);
    return response.json();
  },
  
  updateHealthMetric: async (id: number, data: any) => {
    const response = await apiRequest("PATCH", `/api/health-metrics/${id}`, data);
    return response.json();
  }
};

// Prescriptions
export const prescriptionsApi = {
  getPatientPrescriptions: async (patientId: number) => {
    const response = await apiRequest("GET", `/api/prescriptions/patient/${patientId}`);
    return response.json();
  },
  
  getActivePatientPrescriptions: async (patientId: number) => {
    const response = await apiRequest("GET", `/api/prescriptions/patient/${patientId}/active`);
    return response.json();
  },
  
  createPrescription: async (data: any) => {
    const response = await apiRequest("POST", "/api/prescriptions", data);
    return response.json();
  },
  
  updatePrescription: async (id: number, data: any) => {
    const response = await apiRequest("PATCH", `/api/prescriptions/${id}`, data);
    return response.json();
  },
  
  requestRefill: async (id: number) => {
    // This sends a refill request via the API
    const response = await apiRequest("POST", `/api/prescriptions/${id}/refill`);
    return response.json();
  }
};

// Device alerts
export const alertsApi = {
  getPatientDeviceAlerts: async (patientId: number) => {
    const response = await apiRequest("GET", `/api/device-alerts/patient/${patientId}`);
    return response.json();
  },
  
  getUnreadPatientDeviceAlerts: async (patientId: number) => {
    const response = await apiRequest("GET", `/api/device-alerts/patient/${patientId}/unread`);
    return response.json();
  },
  
  markDeviceAlertAsRead: async (id: number) => {
    const response = await apiRequest("PATCH", `/api/device-alerts/${id}/read`, {});
    return response.json();
  },
  
  resolveDeviceAlert: async (id: number, notes: string) => {
    const response = await apiRequest("PATCH", `/api/device-alerts/${id}/resolve`, { notes });
    return response.json();
  }
};

// Updates
export const updatesApi = {
  getPatientUpdates: async (patientId: number) => {
    const response = await apiRequest("GET", `/api/updates/patient/${patientId}`);
    return response.json();
  },
  
  createUpdate: async (data: any) => {
    const response = await apiRequest("POST", "/api/updates", data);
    return response.json();
  }
};

// Messages
export const messagesApi = {
  getUserMessages: async (userId: number) => {
    if (!userId) {
      console.warn('getUserMessages was called without a valid userId');
      return [];
    }
    try {
      console.log('Fetching messages for user ID:', userId);
      const response = await apiRequest("GET", `/api/messages/user/${userId}`);
      return response.json();
    } catch (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
  },
  
  getConversation: async (user1Id: number, user2Id: number) => {
    const response = await apiRequest("GET", `/api/messages/conversation/${user1Id}/${user2Id}`);
    return response.json();
  },
  
  createMessage: async (data: any) => {
    // Make sure to format the timestamp properly if it's a Date object
    const formattedData = {
      ...data,
      timestamp: data.timestamp instanceof Date 
        ? data.timestamp.toISOString() 
        : data.timestamp,
    };
    console.log('Sending message with data:', formattedData);
    const response = await apiRequest("POST", "/api/messages", formattedData);
    return response.json();
  },
  
  markMessageAsRead: async (id: number) => {
    const response = await apiRequest("PATCH", `/api/messages/${id}/read`, {});
    return response.json();
  }
};

// Support requests
export const supportApi = {
  getPatientSupportRequests: async (patientId: number) => {
    if (!patientId) {
      return [];
    }
    const response = await apiRequest("GET", `/api/support-requests/patient/${patientId}`);
    return response.json();
  },
  
  createSupportRequest: async (data: any) => {
    // Format timestamp properly if it's a Date object
    const formattedData = {
      ...data,
      timestamp: data.timestamp instanceof Date 
        ? data.timestamp.toISOString() 
        : data.timestamp,
    };
    
    console.log('Creating support request with data:', formattedData);
    const response = await apiRequest("POST", "/api/support-requests", formattedData);
    return response.json();
  },
  
  updateSupportRequestStatus: async (id: number, status: string, notes?: string) => {
    const response = await apiRequest("PATCH", `/api/support-requests/${id}/status`, { status, notes });
    return response.json();
  }
};
