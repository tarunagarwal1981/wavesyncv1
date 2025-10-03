/**
 * Example component demonstrating various ways to use the WaveSync API
 * This shows both server actions and API client usage patterns
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api/client';
import { CertificateData, WeatherData } from '@/lib/api/types';

// Example 1: Using server actions (recommended for forms)
import { createCertificateAction } from '@/lib/actions/certificate-actions';
import { updateProfileAction } from '@/lib/actions/profile-actions';
import { markNotificationAsReadAction } from '@/lib/actions/notification-actions';

export function CertificatesExample() {
  const [certificates, setCertificates] = useState<CertificateData[]>([]);
  const [loading, setLoading] = useState(false);

  // Example using API client for data fetching
  async function fetchCertificates() {
    setLoading(true);
    try {
      const { data, error } = await api.get<CertificateData[]>('/certificates');
      if (error) {
        console.error('Error fetching certificates:', error);
      } else {
        setCertificates(data || []);
      }
    } catch (error) {
      console.error('Network error:', error);
    } finally {
      setLoading(false);
    }
  }

  // Example using server action for form submission
  async function handleCreateCertificate(formData: FormData) {
    const result = await createCertificateAction(formData);
    if (result.success) {
      // Refresh certificates list
      fetchCertificates();
      alert(result.message);
    } else {
      alert(`Error: ${result.error}`);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Certificates Management</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Server Action Form */}
        <form action={handleCreateCertificate} className="space-y-2">
          <Label htmlFor="name">Certificate Name</Label>
          <Input type="text" name="name" id="name" required />
          
          <Label htmlFor="type">Type</Label>
          <Input type="text" name="type" id="type" required />
          
          <Label htmlFor="issuer">Issuer</Label>
          <Input type="text" name="issuer" id="issuer" required />
          
          <Label htmlFor="certificateNumber">Certificate Number</Label>
          <Input type="text" name="certificateNumber" id="certificateNumber" required />
          
          <Label htmlFor="issueDate">Issue Date</Label>
          <Input type="date" name="issueDate" id="issueDate" required />
          
          <Label htmlFor="expiryDate">Expiry Date</Label>
          <Input type="date" name="expiryDate" id="expiryDate" required />
          
          <Button type="submit">Create Certificate</Button>
        </form>

        {/* API Client Usage */}
        <div className="space-y-2">
          <Button onClick={fetchCertificates} disabled={loading}>
            {loading ? 'Loading...' : 'Fetch Certificates'}
          </Button>
          
          {certificates.length > 0 && (
            <div className="space-y-2">
              <h3>Existing Certificates:</h3>
              {certificates.map(cert => (
                <div key={cert.id} className="p-2 border rounded">
                  <strong>{cert.name}</strong> - {cert.status}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function ProfileExample() {
  async function handleProfileUpdate(formData: FormData) {
    const result = await updateProfileAction(formData);
    if (result.success) {
      alert('Profile updated successfully!');
    } else {
      alert(`Error: ${result.error}`);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Update</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={handleProfileUpdate} className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input type="text" name="firstName" id="firstName" />
          
          <Label htmlFor="lastName">Last Name</Label>
          <Input type="text" name="lastName" id="lastName" />
          
          <Label htmlFor="phone">Phone</Label>
          <Input type="tel" name="phone" id="phone" />
          
          <Label htmlFor="department">Department</Label>
          <Input type="text" name="department" id="department" />
          
          <Button type="submit">Update Profile</Button>
        </form>
      </CardContent>
    </Card>
  );
}

export function WeatherExample() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [coordinates, setCoordinates] = useState({ lat: '', lon: '' });

  async function fetchWeather() {
    if (!coordinates.lat || !coordinates.lon) {
      alert('Please enter latitude and longitude');
      return;
    }

    try {
      const { data, error } = await api.get<WeatherData>(
        `/weather?lat=${coordinates.lat}&lon=${coordinates.lon}`
      );
      
      if (error) {
        alert(`Error: ${error}`);
      } else {
        setWeather(data!);
      }
    } catch (error) {
      alert('Network error occurred');
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weather API Example</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="lat">Latitude</Label>
          <Input
            type="number"
            value={coordinates.lat}
            onChange={(e) => setCoordinates({ ...coordinates, lat: e.target.value })}
            id="lat"
            step="any"
          />
          
          <Label htmlFor="lon">Longitude</Label>
          <Input
            type="number"
            value={coordinates.lon}
            onChange={(e) => setCoordinates({ ...coordinates, lon: e.target.value })}
            id="lon"
            step="any"
          />
          
          <Button onClick={fetchWeather}>Get Weather</Button>
        </div>

        {weather && (
          <div className="space-y-2">
            <h3>Current Weather:</h3>
            <p><strong>Location:</strong> {weather.location.name}</p>
            <p><strong>Temperature:</strong> {weather.current.temperature}°C</p>
            <p><strong>Humidity:</strong> {weather.current.humidity}%</p>
            <p><strong>Description:</strong> {weather.current.description}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function NotificationExample() {
  const [notificationId, setNotificationId] = useState('');

  async function markAsRead() {
    if (!notificationId) {
      alert('Please enter a notification ID');
      return;
    }

    const result = await markNotificationAsReadAction(notificationId);
    if (result.success) {
      alert('Notification marked as read!');
    } else {
      alert(`Error: ${result.error}`);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="notificationId">Notification ID</Label>
          <Input
            type="text"
            value={notificationId}
            onChange={(e) => setNotificationId(e.target.value)}
            id="notificationId"
            placeholder="Enter notification ID"
          />
          <Button onClick={markAsRead}>Mark as Read</Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Example of error handling wrapper usage
export function ErrorHandlingExample() {
  const [result, setResult] = useState<{ data?: any; error?: string } | null>(null);

  async function fetchWithErrorHandling() {
    const { data, error } = await handleApiCall(
      api.get<CertificateData[]>('/certificates')
    );
    setResult({ data, error });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Error Handling Example</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={fetchWithErrorHandling}>
          Fetch with Error Handling
        </Button>
        
        {result && (
          <div className="space-y-2">
            {result.data && (
              <div className="text-green-600">
                Success: {Array.isArray(result.data) ? result.data.length : 'Data received'}
              </div>
            )}
            {result.error && (
              <div className="text-red-600">Error: {result.error}</div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Main example component
export function ApiUsageExample() {
  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">WaveSync API Usage Examples</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CertificatesExample />
        <ProfileExample />
        <WeatherExample />
        <NotificationExample />
        <ErrorHandlingExample />
      </div>
      
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Key Points:</h3>
        <ul className="list-disc list-inside text-sm space-y-1">
          <li>Use <strong>server actions</strong> for form submissions and mutations</li>
          <li>Use <strong>API client</strong> for data fetching and external API calls</li>
          <li>All actions include built-in validation and error handling</li>
          <li>Actions automatically handle authentication and authorization</li>
          <li>Response formats are consistent across all endpoints</li>
          <li>Rate limiting is automatically applied</li>
        </ul>
      </div>
    </div>
  );
}

// Import for handleApiCall from the client utility
import { handleApiCall } from '@/lib/api/client';



