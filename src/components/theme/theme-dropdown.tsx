import { Moon, Sun } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { TTheme, useTheme } from '@/components/theme/theme-provider';
import { FC } from 'react';
import type { VariantProps } from 'class-variance-authority';


interface IProps {
  className?: string;
  dropdownContentClassName?: string;
  buttonVariant?: VariantProps<typeof buttonVariants>['variant'];
  align?: 'start' | 'end' | 'center';
}

const ThemeDropdown: FC<IProps> = (props) => {
  const { className, buttonVariant = 'outline', align = 'end', dropdownContentClassName } = props;
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={className} asChild>
        <Button variant={buttonVariant} size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"/>
          <Moon
            className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"/>
          <span className="sr-only">
            Toggle theme dropdown
          </span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align={align} className={dropdownContentClassName}>
        <DropdownMenuLabel>
          Select theme
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuRadioGroup value={theme}>
          {options.map(option => (
            <DropdownMenuRadioItem value={option.value} key={option.value} onClick={() => setTheme(option.value)}>
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const options: { label: string; value: TTheme }[] = [
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
  { label: 'System', value: 'system' }
];

export default ThemeDropdown;
