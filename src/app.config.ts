export default defineAppConfig({
  ui: {
    primary: 'primary',
    gray: 'cool',
    strategy: 'override',
    // Input components - light, readable backgrounds
    input: {
      default: {
        size: 'md',
        color: 'white',
        variant: 'outline'
      },
      color: {
        white: {
          outline: 'bg-white dark:bg-white text-navy-900 placeholder:text-navy-400 ring-1 ring-inset ring-gray-300 dark:ring-gray-300 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400'
        }
      }
    },
    textarea: {
      default: {
        size: 'md',
        color: 'white',
        variant: 'outline'
      },
      color: {
        white: {
          outline: 'bg-white dark:bg-white text-navy-900 placeholder:text-navy-400 ring-1 ring-inset ring-gray-300 dark:ring-gray-300 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400'
        }
      }
    },
    select: {
      default: {
        size: 'md',
        color: 'white',
        variant: 'outline'
      },
      color: {
        white: {
          outline: 'bg-white dark:bg-white text-navy-900 placeholder:text-navy-400 ring-1 ring-inset ring-gray-300 dark:ring-gray-300 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400'
        }
      }
    },
    selectMenu: {
      default: {
        size: 'md',
        color: 'white',
        variant: 'outline'
      },
      color: {
        white: {
          outline: 'bg-white dark:bg-white text-navy-900 placeholder:text-navy-400 ring-1 ring-inset ring-gray-300 dark:ring-gray-300 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400'
        }
      }
    },
    // Cards - clean white backgrounds
    card: {
      background: 'bg-white',
      ring: 'ring-1 ring-gray-200',
      divide: 'divide-y divide-gray-200'
    },
    // Buttons - readable text in light/dark
    button: {
      color: {
        primary: {
          solid: 'bg-primary text-white hover:bg-navy-accent disabled:bg-primary aria-disabled:bg-primary focus-visible:ring-2 focus-visible:ring-primary-500'
        }
      }
    },
    // Form groups - darker labels/helpers for white backgrounds
    formGroup: {
      label: {
        base: 'block font-medium text-navy-700 dark:text-white'
      },
      description: 'text-navy-500',
      hint: 'text-navy-500',
      help: 'mt-2 text-navy-500',
      error: 'mt-2 text-red-500'
    },
    // Radios - clearer borders and labels on white
    radio: {
      base: 'h-4 w-4 focus:ring-0 focus:ring-transparent focus:ring-offset-transparent',
      form: 'form-radio',
      color: 'text-primary',
      background: 'bg-white',
      border: 'border border-navy-300',
      label: 'text-sm font-medium text-navy-700',
      help: 'text-sm text-navy-500'
    }
  },
  nuxtIcon: {}
})
