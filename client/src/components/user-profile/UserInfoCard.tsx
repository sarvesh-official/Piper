"use client";
import { useModal } from "@/hooks/useModal";
import React, { useState, useEffect } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Modal } from "../ui/modal";
import { useUser } from "@clerk/nextjs";
import { toast } from "react-toastify";
import { EmailAddressResource } from "@clerk/types";
import { Textarea } from "../ui/textarea";

// Remove phone validation functions that are no longer needed

export default function UserInfoCard() {
  const { isOpen, openModal, closeModal } = useModal();
  const { user, isLoaded } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state - replace phone with bio
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    bio: "",
  });
  
  // Error states - remove phone error
  const [emailError, setEmailError] = useState<string | null>(null);

  // Verification states - remove phone verification states
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [emailVerificationCode, setEmailVerificationCode] = useState("");
  const [newEmailObj, setNewEmailObj] = useState<EmailAddressResource | undefined>();

  // Initialize form data when user is loaded - add bio from unsafeMetadata
  useEffect(() => {
    if (isLoaded && user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.emailAddresses[0]?.emailAddress || "",
        bio: user.unsafeMetadata.bio as string || "",
      });
    }
  }, [isLoaded, user]);

  // Handle form input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear errors when input changes
    if (name === 'email') setEmailError(null);
  };

  const handleSave = async () => {
    if (!user) return;
    
    // Reset error states
    setEmailError(null);
    
    setIsSubmitting(true);
    try {
      // Update user profile one field at a time
      if (user.firstName !== formData.firstName) {
         await user.update({
          firstName: formData.firstName,
        });
      }
      if (user.lastName !== formData.lastName) {
        await user.update({
          lastName: formData.lastName,
        });
      }

      // Update bio in unsafeMetadata
      const currentBio = user.unsafeMetadata.bio as string || "";
      const existingMetadata = user.unsafeMetadata as Record<string, any> || {};

      if (currentBio !== formData.bio) {
        await user.update({
          unsafeMetadata: {
            ...existingMetadata,
            bio: formData.bio
          }
        });
      }

      // Update primary email if changed
      if (user.emailAddresses[0]?.emailAddress !== formData.email && formData.email) {
        try {
          const res = await user.createEmailAddress({ email: formData.email });
          await user.reload();
          
          const emailAddress = user.emailAddresses.find(a => a.id === res.id);
          setNewEmailObj(emailAddress);
          
          if (emailAddress) {
            await emailAddress.prepareVerification({ strategy: 'email_code' });
            setIsVerifyingEmail(true);
            setIsSubmitting(false);
            return; // Stop execution here until email is verified
          }
        } catch (error: any) {
          console.error("Error creating email address:", error);
          if (error.errors && error.errors.some((e: any) => e.code === "form_identifier_exists")) {
            setEmailError("That email address is already taken. Please use another one.");
            setIsSubmitting(false);
            return;
          } else {
            // Handle other email-related errors
            const errorMessage = error.errors?.[0]?.message || error.message || "Failed to update email address";
            setEmailError(`Error: ${errorMessage}`);
            setIsSubmitting(false);
            return;
          }
        }
      }

      toast.success("Personal information updated successfully!");
      closeModal();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update information. Please try again.");
    } finally {
      if (!isVerifyingEmail) {
        setIsSubmitting(false);
      }
    }
  };

  // Handle email verification
  const verifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmailObj) return;
    
    setIsSubmitting(true);
    try {
      const emailVerifyAttempt = await newEmailObj.attemptVerification({ code: emailVerificationCode });
      
      if (emailVerifyAttempt?.verification.status === 'verified') {
        toast.success("Email verified successfully!");
        closeModal();
      } else {
        toast.error("Email verification failed. Please check the code and try again.");
      }
    } catch (error) {
      console.error("Email verification error:", error);
      toast.error("Failed to verify email. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render verification UI if needed
  const renderVerificationUI = () => {
    if (isVerifyingEmail) {
      return (
        <div className="px-2">
          <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90">
            Verify Email Address
          </h5>
          <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
            We've sent a verification code to {formData.email}. Please enter it below.
          </p>
          <form onSubmit={verifyEmail} className="flex flex-col gap-4">
            <div>
              <Label>Verification Code</Label>
              <Input
                type="text"
                value={emailVerificationCode}
                onChange={(e) => setEmailVerificationCode(e.target.value)}
                placeholder="Enter code"
              />
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <Button size="sm" variant="outline" onClick={() => setIsVerifyingEmail(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                size="sm"
                type="submit"
                className="dark:bg-piper-cyan dark:text-piper-darkblue"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Verifying..." : "Verify Email"}
              </Button>
            </div>
          </form>
        </div>
      );
    }

    return (
      <>
        <div className="custom-scrollbar h-[250px] overflow-y-auto px-2 pb-3">
          <div className="mt-7">
            <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
              Personal Information
            </h5>

            <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
              <div className="col-span-2">
                <Label>Bio</Label>
                <Textarea 
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Tell us about yourself..."
                  rows={4}
                  className="resize-none"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Brief description that will appear on your profile
                </p>
              </div>
              <div className="col-span-2 lg:col-span-1">
                <Label>First Name</Label>
                <Input 
                  type="text" 
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                />
              </div>

              <div className="col-span-2 lg:col-span-1">
                <Label>Last Name</Label>
                <Input 
                  type="text" 
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </div>

              <div className="col-span-2 lg:col-span-1">
                <Label>Email Address</Label>
                <Input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={emailError ? "border-red-500" : ""}
                />
                {emailError && (
                  <p className="mt-1 text-xs text-red-500">{emailError}</p>
                )}
              </div>

            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
          <Button size="sm" variant="outline" onClick={closeModal} disabled={isSubmitting}>
            Close
          </Button>
          <Button 
            size="sm" 
            className="dark:bg-piper-cyan dark:text-piper-darkblue" 
            onClick={handleSave}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </>
    );
  };

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
            Personal Information
          </h4>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
            <div className="col-span-2">
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Bio
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {typeof user?.unsafeMetadata.bio === "string" &&
                  user?.unsafeMetadata.bio != "" ? (
                    user.unsafeMetadata.bio
                  ) : (
                    <span className="text-xs font-light">
                      Bio not set
                    </span>
                  )}
              </p>
            </div>
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                First Name
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
               {user?.firstName}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Last Name
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {user?.lastName ||  <span className="text-xs font-light">Last Name not set</span>}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Email address
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {user?.emailAddresses[0]?.emailAddress}
              </p>
            </div>

          </div>
        </div>

        <button
          onClick={openModal}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
        >
          <svg
            className="fill-current"
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z"
              fill=""
            />
          </svg>
          Edit
        </button>
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              {isVerifyingEmail ? "Verify Email" : "Edit Personal Information"}
            </h4>
            {!isVerifyingEmail && (
              <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
                Update your details to keep your profile up-to-date.
                {formData.email !== user?.emailAddresses[0]?.emailAddress && 
                  " Changing email will require verification."}
              </p>
            )}
          </div>
          <form className="flex flex-col" onSubmit={(e) => e.preventDefault()}>
            {renderVerificationUI()}
          </form>
        </div>
      </Modal>
    </div>
  );
}
