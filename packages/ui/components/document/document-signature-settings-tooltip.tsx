import { InfoIcon } from 'lucide-react';

import { Tooltip, TooltipContent, TooltipTrigger } from '@documenso/ui/primitives/tooltip';

export const DocumentSignatureSettingsTooltip = () => {
  return (
    <Tooltip>
      <TooltipTrigger type="button">
        <InfoIcon className="mx-2 h-4 w-4" />
      </TooltipTrigger>

      <TooltipContent className="text-foreground max-w-md space-y-2 p-4">
        <h2>
          <strong>
            Signature types
          </strong>
        </h2>

        <p>
          
            The types of signatures that recipients are allowed to use when signing the document.
          
        </p>

        <ul className="ml-3.5 list-outside list-disc space-y-0.5 py-2">
          <li>
            
              <strong>
                Drawn
              </strong>
              {' - '}
              A signature that is drawn using a mouse or stylus.
            
          </li>
          <li>
            
              <strong>
                Typed
              </strong>
              {' - '}
              A signature that is typed using a keyboard.
            
          </li>
          <li>
            
              <strong>
                Uploaded
              </strong>
              {' - '}
              A signature that is uploaded from a file.
            
          </li>
        </ul>
      </TooltipContent>
    </Tooltip>
  );
};
