import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { usePatient } from "@/hooks/usePatient";
import { usePatientMetrics } from "@/hooks/usePatientMetrics";
import { useToast } from "@/hooks/use-toast";
import { PencilIcon, Save, User, Sliders, Shield, Bell } from "lucide-react";
import PatientInfo from "@/components/common/PatientInfo";

export default function SettingsPage() {
  const { user, profile, updateUser } = useAuth();
  const { updatePatient } = usePatient();
  const { latestMetrics, updateMetrics } = usePatientMetrics();
  const { toast } = useToast();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingDevice, setIsEditingDevice] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: profile?.phone || "",
    address: profile?.address || "",
    emergencyContact: profile?.emergencyContact || "",
  });
  
  const [deviceSettings, setDeviceSettings] = useState({
    sensorSensitivity: latestMetrics?.sensorSensitivity || 75,
    vibrationIntensity: 65,
    autoCalibration: true,
    notifyLowBattery: true,
    notifyErrors: true,
    notifyCalibration: true,
    dataSharing: false,
  });

  // Handle profile form changes
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle device settings changes
  const handleDeviceSettingChange = (name: string, value: any) => {
    setDeviceSettings(prev => ({ ...prev, [name]: value }));
  };

  // Save profile changes
  const saveProfileChanges = async () => {
    try {
      // Update user profile
      if (user) {
        await updateUser({
          ...user,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
        });
      }
      
      // Update patient profile
      if (profile) {
        await updatePatient(profile.id, {
          ...profile,
          phone: formData.phone,
          address: formData.address,
          emergencyContact: formData.emergencyContact,
        });
      }
      
      setIsEditingProfile(false);
      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    }
  };

  // Save device settings
  const saveDeviceSettings = async () => {
    try {
      // Update sensor sensitivity in metrics
      if (latestMetrics && profile) {
        await updateMetrics(latestMetrics.id, {
          ...latestMetrics,
          sensorSensitivity: deviceSettings.sensorSensitivity,
        });
      }
      
      setIsEditingDevice(false);
      toast({
        title: "Device settings updated",
        description: "Your device settings have been updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update device settings",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold leading-tight text-neutral-900">Settings</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Manage your account and device settings
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sidebar with user profile summary */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Your Profile</CardTitle>
              <CardDescription>View and manage your information</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage src={user?.profileImage} alt={user?.firstName} />
                <AvatarFallback className="text-xl">
                  {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <h3 className="text-lg font-medium">{user?.firstName} {user?.lastName}</h3>
              <p className="text-sm text-neutral-500">{user?.email}</p>
              <p className="text-sm text-neutral-500 capitalize">{user?.role}</p>
              
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => setIsEditingProfile(true)}
              >
                <PencilIcon className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
            </CardContent>
          </Card>
        </div>
        
        {/* Main settings area */}
        <div className="md:col-span-2">
          <Tabs defaultValue="profile">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile" className="flex items-center">
                <User className="mr-2 h-4 w-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="device" className="flex items-center">
                <Sliders className="mr-2 h-4 w-4" />
                Device
              </TabsTrigger>
              <TabsTrigger value="privacy" className="flex items-center">
                <Shield className="mr-2 h-4 w-4" />
                Privacy
              </TabsTrigger>
            </TabsList>
            
            {/* Profile Settings */}
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    {isEditingProfile ? "Edit your personal information" : "View your personal information"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleProfileChange}
                        disabled={!isEditingProfile}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleProfileChange}
                        disabled={!isEditingProfile}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleProfileChange}
                        disabled={!isEditingProfile}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleProfileChange}
                        disabled={!isEditingProfile}
                      />
                    </div>
                    
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleProfileChange}
                        disabled={!isEditingProfile}
                      />
                    </div>
                    
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="emergencyContact">Emergency Contact</Label>
                      <Input
                        id="emergencyContact"
                        name="emergencyContact"
                        value={formData.emergencyContact}
                        onChange={handleProfileChange}
                        disabled={!isEditingProfile}
                        placeholder="Name, relationship, phone number"
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  {isEditingProfile ? (
                    <div className="flex space-x-2">
                      <Button variant="outline" onClick={() => setIsEditingProfile(false)}>
                        Cancel
                      </Button>
                      <Button onClick={saveProfileChanges}>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </Button>
                    </div>
                  ) : (
                    <Button onClick={() => setIsEditingProfile(true)}>
                      <PencilIcon className="mr-2 h-4 w-4" />
                      Edit Profile
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </TabsContent>
            
            {/* Device Settings */}
            <TabsContent value="device">
              <Card>
                <CardHeader>
                  <CardTitle>Device Settings</CardTitle>
                  <CardDescription>
                    {isEditingDevice ? "Adjust your Suralis system settings" : "View your device settings"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <Label>Sensor Sensitivity</Label>
                        <span className="text-sm text-neutral-500">{deviceSettings.sensorSensitivity}%</span>
                      </div>
                      <Slider
                        value={[deviceSettings.sensorSensitivity]}
                        min={0}
                        max={100}
                        step={1}
                        disabled={!isEditingDevice}
                        onValueChange={(value) => handleDeviceSettingChange("sensorSensitivity", value[0])}
                      />
                      <p className="text-xs text-neutral-500 mt-1">
                        Higher sensitivity increases responsiveness but may cause more false positives
                      </p>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-2">
                        <Label>Vibration Intensity</Label>
                        <span className="text-sm text-neutral-500">{deviceSettings.vibrationIntensity}%</span>
                      </div>
                      <Slider
                        value={[deviceSettings.vibrationIntensity]}
                        min={0}
                        max={100}
                        step={1}
                        disabled={!isEditingDevice}
                        onValueChange={(value) => handleDeviceSettingChange("vibrationIntensity", value[0])}
                      />
                      <p className="text-xs text-neutral-500 mt-1">
                        Adjust the strength of haptic feedback
                      </p>
                    </div>
                    
                    <div className="border-t pt-4">
                      <h3 className="text-sm font-medium mb-4">System Settings</h3>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="autoCalibration">Automatic Calibration</Label>
                            <p className="text-xs text-neutral-500">Allow your device to calibrate automatically</p>
                          </div>
                          <Switch
                            id="autoCalibration"
                            checked={deviceSettings.autoCalibration}
                            disabled={!isEditingDevice}
                            onCheckedChange={(value) => handleDeviceSettingChange("autoCalibration", value)}
                          />
                        </div>
                        
                        <div className="border-t pt-4">
                          <h3 className="text-sm font-medium mb-4 flex items-center">
                            <Bell className="mr-2 h-4 w-4" />
                            Notification Settings
                          </h3>
                          
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <Label htmlFor="notifyLowBattery">Low Battery Alerts</Label>
                                <p className="text-xs text-neutral-500">Receive alerts when battery is low</p>
                              </div>
                              <Switch
                                id="notifyLowBattery"
                                checked={deviceSettings.notifyLowBattery}
                                disabled={!isEditingDevice}
                                onCheckedChange={(value) => handleDeviceSettingChange("notifyLowBattery", value)}
                              />
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div>
                                <Label htmlFor="notifyErrors">Error Notifications</Label>
                                <p className="text-xs text-neutral-500">Receive notifications about system errors</p>
                              </div>
                              <Switch
                                id="notifyErrors"
                                checked={deviceSettings.notifyErrors}
                                disabled={!isEditingDevice}
                                onCheckedChange={(value) => handleDeviceSettingChange("notifyErrors", value)}
                              />
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div>
                                <Label htmlFor="notifyCalibration">Calibration Reminders</Label>
                                <p className="text-xs text-neutral-500">Receive reminders for regular calibration</p>
                              </div>
                              <Switch
                                id="notifyCalibration"
                                checked={deviceSettings.notifyCalibration}
                                disabled={!isEditingDevice}
                                onCheckedChange={(value) => handleDeviceSettingChange("notifyCalibration", value)}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  {isEditingDevice ? (
                    <div className="flex space-x-2">
                      <Button variant="outline" onClick={() => setIsEditingDevice(false)}>
                        Cancel
                      </Button>
                      <Button onClick={saveDeviceSettings}>
                        <Save className="mr-2 h-4 w-4" />
                        Save Settings
                      </Button>
                    </div>
                  ) : (
                    <Button onClick={() => setIsEditingDevice(true)}>
                      <PencilIcon className="mr-2 h-4 w-4" />
                      Edit Settings
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </TabsContent>
            
            {/* Privacy Settings */}
            <TabsContent value="privacy">
              <Card>
                <CardHeader>
                  <CardTitle>Privacy Settings</CardTitle>
                  <CardDescription>Manage your data and privacy preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="border-b pb-4">
                      <h3 className="text-sm font-medium mb-4">Data Sharing</h3>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="dataSharing">Anonymous Data Sharing</Label>
                          <p className="text-xs text-neutral-500">
                            Share anonymous usage data to help improve Suralis technology
                          </p>
                        </div>
                        <Switch
                          id="dataSharing"
                          checked={deviceSettings.dataSharing}
                          onCheckedChange={(value) => handleDeviceSettingChange("dataSharing", value)}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium mb-4">Your Data</h3>
                      
                      <p className="text-sm text-neutral-600 mb-4">
                        At Saphenus Medical Technology, we take your privacy seriously. Your personal data and health information
                        are stored securely and only shared with your care team.
                      </p>
                      
                      <div className="flex space-x-4">
                        <Button variant="outline" size="sm">
                          Download My Data
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                          Request Account Deletion
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* Additional Patient Information */}
      {profile && user && (
        <div className="mt-6">
          <PatientInfo patient={profile} userName={`${user.firstName} ${user.lastName}`} />
        </div>
      )}
    </div>
  );
}
