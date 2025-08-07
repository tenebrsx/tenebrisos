// Navigation Test Utility
// This file contains functions to verify navigation functionality

const ROUTES = {
  HOME: '/',
  ACTIVITIES: '/activities',
  SCHEDULE: '/schedule',
  THINGS_TO_DO: '/things-to-do',
  NOTES: '/notes',
  TODOS: '/todos',
  SETTINGS: '/settings',
  PROFILE: '/profile',
  STATISTICS: '/statistics'
};

const COMMAND_PALETTE_COMMANDS = [
  { id: 'nav-dashboard', expectedPath: '/' },
  { id: 'nav-stats', expectedPath: '/statistics' },
  { id: 'nav-calendar', expectedPath: '/schedule' },
  { id: 'nav-activities', expectedPath: '/activities' },
  { id: 'open-settings', expectedPath: '/settings' },
  { id: 'user-profile', expectedPath: '/profile' }
];

/**
 * Verify all routes are properly defined
 */
export const verifyRoutes = () => {
  const results = [];

  Object.entries(ROUTES).forEach(([name, path]) => {
    results.push({
      route: name,
      path: path,
      status: 'defined',
      timestamp: new Date().toISOString()
    });
  });

  return results;
};

/**
 * Test navigation function with mock router
 */
export const testNavigation = (mockNavigate) => {
  const results = [];

  Object.entries(ROUTES).forEach(([name, path]) => {
    try {
      mockNavigate(path);
      results.push({
        route: name,
        path: path,
        status: 'success',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      results.push({
        route: name,
        path: path,
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });

  return results;
};

/**
 * Verify command palette navigation commands
 */
export const verifyCommandPaletteNavigation = () => {
  const results = [];

  COMMAND_PALETTE_COMMANDS.forEach(command => {
    const isValidRoute = Object.values(ROUTES).includes(command.expectedPath);

    results.push({
      commandId: command.id,
      expectedPath: command.expectedPath,
      isValidRoute: isValidRoute,
      status: isValidRoute ? 'valid' : 'invalid',
      timestamp: new Date().toISOString()
    });
  });

  return results;
};

/**
 * Test header navigation items
 */
export const verifyHeaderNavigation = () => {
  const headerRoutes = [ROUTES.PROFILE, ROUTES.SETTINGS];
  const results = [];

  headerRoutes.forEach(route => {
    const isValidRoute = Object.values(ROUTES).includes(route);

    results.push({
      route: route,
      location: 'header',
      isValidRoute: isValidRoute,
      status: isValidRoute ? 'valid' : 'invalid',
      timestamp: new Date().toISOString()
    });
  });

  return results;
};

/**
 * Test bottom navigation items
 */
export const verifyBottomNavigation = () => {
  const bottomNavRoutes = [
    ROUTES.ACTIVITIES,
    ROUTES.HOME,
    ROUTES.THINGS_TO_DO,
    ROUTES.NOTES,
    ROUTES.TODOS,
    ROUTES.SCHEDULE,
    ROUTES.STATISTICS
  ];

  const results = [];

  bottomNavRoutes.forEach(route => {
    const isValidRoute = Object.values(ROUTES).includes(route);

    results.push({
      route: route,
      location: 'bottom',
      isValidRoute: isValidRoute,
      status: isValidRoute ? 'valid' : 'invalid',
      timestamp: new Date().toISOString()
    });
  });

  return results;
};

/**
 * Run comprehensive navigation test
 */
export const runNavigationTests = (mockNavigate = null) => {
  const testResults = {
    timestamp: new Date().toISOString(),
    routes: verifyRoutes(),
    commandPalette: verifyCommandPaletteNavigation(),
    headerNavigation: verifyHeaderNavigation(),
    bottomNavigation: verifyBottomNavigation(),
    summary: {
      totalRoutes: Object.keys(ROUTES).length,
      validCommandPaletteCommands: 0,
      validHeaderRoutes: 0,
      validBottomNavRoutes: 0
    }
  };

  // Calculate summary statistics
  testResults.summary.validCommandPaletteCommands = testResults.commandPalette.filter(
    cmd => cmd.status === 'valid'
  ).length;

  testResults.summary.validHeaderRoutes = testResults.headerNavigation.filter(
    nav => nav.status === 'valid'
  ).length;

  testResults.summary.validBottomNavRoutes = testResults.bottomNavigation.filter(
    nav => nav.status === 'valid'
  ).length;

  // Test navigation if mockNavigate is provided
  if (mockNavigate) {
    testResults.navigationTest = testNavigation(mockNavigate);
    testResults.summary.successfulNavigations = testResults.navigationTest.filter(
      test => test.status === 'success'
    ).length;
  }

  return testResults;
};

/**
 * Check for navigation issues
 */
export const checkNavigationIssues = () => {
  const issues = [];
  const commandPaletteResults = verifyCommandPaletteNavigation();
  const headerResults = verifyHeaderNavigation();
  const bottomResults = verifyBottomNavigation();

  // Check for invalid command palette routes
  commandPaletteResults.forEach(result => {
    if (!result.isValidRoute) {
      issues.push({
        type: 'command_palette',
        severity: 'high',
        message: `Command ${result.commandId} points to invalid route: ${result.expectedPath}`,
        suggestion: `Update command to use a valid route from: ${Object.values(ROUTES).join(', ')}`
      });
    }
  });

  // Check for missing critical navigation
  const criticalRoutes = [ROUTES.SETTINGS, ROUTES.PROFILE];
  criticalRoutes.forEach(route => {
    const inHeader = headerResults.some(r => r.route === route && r.isValidRoute);
    const inBottom = bottomResults.some(r => r.route === route && r.isValidRoute);
    const inCommandPalette = commandPaletteResults.some(
      r => r.expectedPath === route && r.isValidRoute
    );

    if (!inHeader && !inBottom && !inCommandPalette) {
      issues.push({
        type: 'accessibility',
        severity: 'medium',
        message: `Route ${route} is not accessible through any navigation method`,
        suggestion: `Add ${route} to header, bottom navigation, or command palette`
      });
    }
  });

  return {
    issues: issues,
    summary: {
      total: issues.length,
      high: issues.filter(i => i.severity === 'high').length,
      medium: issues.filter(i => i.severity === 'medium').length,
      low: issues.filter(i => i.severity === 'low').length
    }
  };
};

/**
 * Generate navigation report
 */
export const generateNavigationReport = () => {
  const testResults = runNavigationTests();
  const issues = checkNavigationIssues();

  return {
    timestamp: new Date().toISOString(),
    testResults: testResults,
    issues: issues,
    recommendations: [
      'Ensure all critical routes are accessible through multiple navigation methods',
      'Test navigation on different screen sizes and devices',
      'Verify keyboard navigation (especially Command+K) works correctly',
      'Check that back navigation works properly from all pages',
      'Validate that navigation state is preserved during page transitions'
    ]
  };
};

// Export constants for use in other files
export { ROUTES, COMMAND_PALETTE_COMMANDS };
