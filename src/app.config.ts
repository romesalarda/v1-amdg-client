export default defineAppConfig({
  ui: {
    primary: 'blue',
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
          outline: 'bg-white dark:bg-white ring-1 ring-inset ring-gray-300 dark:ring-gray-300 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400'
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
          outline: 'bg-white dark:bg-white ring-1 ring-inset ring-gray-300 dark:ring-gray-300 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400'
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
          outline: 'bg-white dark:bg-white ring-1 ring-inset ring-gray-300 dark:ring-gray-300 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400'
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
          outline: 'bg-white dark:bg-white ring-1 ring-inset ring-gray-300 dark:ring-gray-300 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400'
        }
      }
    },
    // Cards - clean white backgrounds
    card: {
      background: 'bg-white',
      ring: 'ring-1 ring-gray-200',
      divide: 'divide-y divide-gray-200'
    }
  },
  nuxtIcon: {}
})
