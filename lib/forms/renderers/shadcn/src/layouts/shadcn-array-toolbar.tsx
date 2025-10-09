import { ArrayTranslations } from "@jsonforms/core";
import { Button } from "@lens2/shadcn/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@lens2/shadcn/components/ui/tooltip";
import { Plus } from "lucide-react";
import React from "react";
import ValidationIcon from "../complex/shadcn-validation-icon";
import { Grid } from "../components";

export interface ShadcnArrayLayoutToolbarProps {
  label: string;
  description: string;
  errors: string;
  path: string;
  enabled: boolean;
  addItem(path: string, data: any): () => void;
  createDefault(): any;
  translations: ArrayTranslations;
  disableAdd?: boolean;
}

export const ShadcnArrayLayoutToolbar = React.memo(
  function ShadcnArrayLayoutToolbar({
    label,
    description,
    errors,
    addItem,
    path,
    enabled,
    createDefault,
    translations,
    disableAdd,
  }: ShadcnArrayLayoutToolbarProps) {
    return (
      <div className="py-2">
        <div className="w-full">
          <Grid container alignItems="center" justifyContent="space-between">
            <Grid>
              <Grid
                container
                justifyContent="flex-start"
                alignItems="center"
                spacing={2}
              >
                <Grid>
                  <h3 className="text-lg font-semibold">{label}</h3>
                </Grid>
                <Grid>
                  {errors.length !== 0 && (
                    <Grid>
                      <ValidationIcon
                        id="tooltip-validation"
                        errorMessages={errors}
                      />
                    </Grid>
                  )}
                </Grid>
              </Grid>
            </Grid>
            {enabled && !disableAdd && (
              <Grid>
                <Grid container>
                  <Grid>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            aria-label={translations.addTooltip}
                            onClick={addItem(path, createDefault())}
                            className="h-8 w-8 p-0"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{translations.addTooltip}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Grid>
                </Grid>
              </Grid>
            )}
          </Grid>
          {description && (
            <p className="text-muted-foreground mt-1 text-sm">{description}</p>
          )}
        </div>
      </div>
    );
  }
);
