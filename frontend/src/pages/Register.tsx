import { useState } from "react";
import { Eye, EyeOff, Loader2, CheckCircle2, User, Mail, Phone, Building2, MapPin, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Form fields matching backend requirements
  const [ownerName, setOwnerName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");
  const [ownerPassword, setOwnerPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [restaurantName, setRestaurantName] = useState("");
  const [address, setAddress] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (ownerPassword !== confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (ownerPassword.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      await register({
        ownerName,
        ownerEmail,
        ownerPhone,
        ownerPassword,
        restaurantName: restaurantName || undefined,
        address: address || undefined,
      });
      
      toast({
        title: "Registration successful!",
        description: "Please check your email for verification code",
      });
      
      // Navigate to OTP verification page
      navigate("/verify-email", { state: { email: ownerEmail } });
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="w-full px-6 py-4 flex items-center justify-between border-b border-gray-200 bg-white">
        <Link to="/" className="flex items-center gap-2">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center"
          >
            <svg
              className="w-5 h-5 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-7-5z" />
            </svg>
          </motion.div>
          <span className="text-xl font-semibold text-gray-900">QRService</span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Already have an account?</span>
          <Link to="/login">
            <Button variant="link" className="text-indigo-600 font-medium p-0 hover:underline">
              Sign In
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="w-full max-w-2xl"
        >
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            {/* Title */}
            <motion.div variants={itemVariants} className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Create Your Account
              </h1>
              <p className="text-gray-600">
                Start managing your restaurant with QR codes
              </p>
            </motion.div>

            {/* Register Form */}
            <motion.form 
              variants={containerVariants}
              onSubmit={handleSubmit} 
              className="space-y-6"
            >
              {/* Owner Information Section */}
              <motion.div variants={itemVariants} className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Owner Information
                </h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Owner Name */}
                  <div className="space-y-2">
                    <Label htmlFor="ownerName" className="text-sm font-medium text-gray-700">
                      Full Name *
                    </Label>
                    <Input
                      id="ownerName"
                      type="text"
                      placeholder="John Doe"
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      className="h-11 border-gray-300"
                      required
                    />
                  </div>

                  {/* Owner Phone */}
                  <div className="space-y-2">
                    <Label htmlFor="ownerPhone" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      Phone Number *
                    </Label>
                    <Input
                      id="ownerPhone"
                      type="tel"
                      placeholder="+84 123 456 789"
                      value={ownerPhone}
                      onChange={(e) => setOwnerPhone(e.target.value)}
                      className="h-11 border-gray-300"
                      required
                    />
                  </div>
                </div>

                {/* Owner Email */}
                <div className="space-y-2">
                  <Label htmlFor="ownerEmail" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    Email Address *
                  </Label>
                  <Input
                    id="ownerEmail"
                    type="email"
                    placeholder="name@company.com"
                    value={ownerEmail}
                    onChange={(e) => setOwnerEmail(e.target.value)}
                    className="h-11 border-gray-300"
                    required
                  />
                </div>
              </motion.div>

              {/* Restaurant Information Section */}
              <motion.div variants={itemVariants} className="space-y-4 pt-4 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Restaurant Information (Optional)
                </h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Restaurant Name */}
                  <div className="space-y-2">
                    <Label htmlFor="restaurantName" className="text-sm font-medium text-gray-700">
                      Restaurant Name
                    </Label>
                    <Input
                      id="restaurantName"
                      type="text"
                      placeholder="My Restaurant"
                      value={restaurantName}
                      onChange={(e) => setRestaurantName(e.target.value)}
                      className="h-11 border-gray-300"
                    />
                  </div>

                  {/* Address */}
                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      Address
                    </Label>
                    <Input
                      id="address"
                      type="text"
                      placeholder="123 Main Street"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="h-11 border-gray-300"
                    />
                  </div>
                </div>
              </motion.div>

              {/* Password Section */}
              <motion.div variants={itemVariants} className="space-y-4 pt-4 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Security
                </h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Password */}
                  <div className="space-y-2">
                    <Label htmlFor="ownerPassword" className="text-sm font-medium text-gray-700">
                      Password *
                    </Label>
                    <div className="relative">
                      <Input
                        id="ownerPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={ownerPassword}
                        onChange={(e) => setOwnerPassword(e.target.value)}
                        className="h-11 border-gray-300 pr-10"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500">Minimum 6 characters</p>
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                      Confirm Password *
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="h-11 border-gray-300 pr-10"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Terms */}
              <motion.div variants={itemVariants} className="text-xs text-gray-600 bg-gray-50 p-4 rounded-lg">
                By creating an account, you agree to our{" "}
                <a href="#" className="text-indigo-600 hover:underline font-medium">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="text-indigo-600 hover:underline font-medium">
                  Privacy Policy
                </a>
              </motion.div>

              {/* Submit Button */}
              <motion.div variants={itemVariants}>
                <Button
                  type="submit"
                  className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-all shadow-lg hover:shadow-xl"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Creating your account...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5 mr-2" />
                      Create Account
                    </>
                  )}
                </Button>
              </motion.div>
            </motion.form>
          </div>

          {/* Footer */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 text-center"
          >
            <p className="text-xs text-gray-500">
              Protected by reCAPTCHA and subject to the Google{" "}
              <a href="#" className="hover:underline">
                Privacy Policy
              </a>{" "}
              and{" "}
              <a href="#" className="hover:underline">
                Terms of Service
              </a>
            </p>
          </motion.div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="w-full px-6 py-4 border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-sm text-gray-600">
          <p>© 2024 QRService Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-gray-900 transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-gray-900 transition-colors">
              Terms of Service
            </a>
            <a href="#" className="hover:text-gray-900 transition-colors">
              Support
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Register;
