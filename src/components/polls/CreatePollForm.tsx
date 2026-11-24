import { useId, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useWeb3 } from "@/hooks/useWeb3";
import { getWeb3ErrorMessage } from "@/lib/web3";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash, Plus, ArrowLeft } from "lucide-react";

export function CreatePollForm() {
  const { createPoll } = useWeb3();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const titleErrorId = useId();
  const optionsErrorId = useId();
  const titleInputRef = useRef<HTMLInputElement>(null);
  const optionInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [title, setTitle] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ title?: string; options?: string }>({});

  // Add option field
  const addOption = () => {
    if (options.length < 10) {
      setOptions([...options, ""]);
      if (errors.options) {
        setErrors((prev) => ({ ...prev, options: undefined }));
      }
    } else {
      toast({
        title: "Maximum Reached",
        description: "You can add up to 10 options",
        variant: "destructive",
      });
    }
  };

  // Remove option field
  const removeOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = [...options];
      newOptions.splice(index, 1);
      setOptions(newOptions);
      if (errors.options) {
        setErrors((prev) => ({ ...prev, options: undefined }));
      }
    } else {
      toast({
        title: "Minimum Required",
        description: "At least 2 options are required",
        variant: "destructive",
      });
    }
  };

  // Update option value
  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
    if (errors.options) {
      setErrors((prev) => ({ ...prev, options: undefined }));
    }
  };

  // Validate form and focus the first invalid field
  const validateForm = () => {
    const newErrors: { title?: string; options?: string } = {};
    let firstInvalidOptionIndex = -1;

    if (!title.trim()) {
      newErrors.title = "Title is required";
    }

    const trimmedOptions = options.map((opt) => opt.trim());
    const emptyIndex = trimmedOptions.findIndex((opt) => !opt);

    if (emptyIndex !== -1) {
      newErrors.options = "All options must be filled";
      firstInvalidOptionIndex = emptyIndex;
    } else {
      const seen = new Set<string>();
      const duplicateIndex = trimmedOptions.findIndex((opt) => {
        const normalized = opt.toLowerCase();
        if (seen.has(normalized)) return true;
        seen.add(normalized);
        return false;
      });
      if (duplicateIndex !== -1) {
        newErrors.options = "Options must be unique";
        firstInvalidOptionIndex = duplicateIndex;
      }
    }

    setErrors(newErrors);

    if (newErrors.title) {
      titleInputRef.current?.focus();
    } else if (firstInvalidOptionIndex !== -1) {
      optionInputRefs.current[firstInvalidOptionIndex]?.focus();
    }

    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);

      const cleanTitle = title.trim();
      const cleanOptions = options.map((opt) => opt.trim());

      const tx = await createPoll(cleanTitle, cleanOptions);

      toast({
        title: "Transaction Sent",
        description: "Creating poll. Please wait for confirmation.",
      });

      // Wait for transaction confirmation
      await tx.wait();

      await queryClient.invalidateQueries({ queryKey: ["polls"] });

      toast({
        title: "Success",
        description: "Poll created successfully!",
      });

      // Redirect to polls page after successful creation
      navigate("/");
    } catch (error) {
      console.error("Error creating poll:", error);
      toast({
        title: "Error",
        description: getWeb3ErrorMessage(error, "Failed to create poll. Please try again."),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => navigate(-1)} className="gap-1">
        <ArrowLeft className="h-4 w-4" />
        <span>Back</span>
      </Button>

      <Card>
        <form onSubmit={handleSubmit} noValidate>
          <CardHeader>
            <CardTitle>Create a New Poll</CardTitle>
            <CardDescription>
              Fill in the details below to create a new poll
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Poll Title</Label>
              <Input
                ref={titleInputRef}
                id="title"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (errors.title) {
                    setErrors((prev) => ({ ...prev, title: undefined }));
                  }
                }}
                placeholder="Enter a title for your poll"
                aria-invalid={errors.title ? "true" : "false"}
                aria-describedby={errors.title ? titleErrorId : undefined}
              />
              {errors.title && (
                <p id={titleErrorId} className="text-xs text-destructive mt-1">
                  {errors.title}
                </p>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>Poll Options</Label>
                <span className="text-xs text-muted-foreground">
                  {options.length}/10 options
                </span>
              </div>

              {options.map((option, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    ref={(el) => {
                      optionInputRefs.current[index] = el;
                    }}
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    aria-label={`Option ${index + 1}`}
                    aria-invalid={errors.options ? "true" : "false"}
                    aria-describedby={errors.options ? optionsErrorId : undefined}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label={`Remove option ${index + 1}`}
                    onClick={() => removeOption(index)}
                    disabled={options.length <= 2}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              {errors.options && (
                <p id={optionsErrorId} className="text-xs text-destructive">
                  {errors.options}
                </p>
              )}

              <Button
                type="button"
                variant="outline"
                onClick={addOption}
                disabled={options.length >= 10}
                className="w-full gap-1"
              >
                <Plus className="h-4 w-4" />
                <span>Add Option</span>
              </Button>
            </div>
          </CardContent>

          <CardFooter className="border-t pt-6">
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create Poll"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
