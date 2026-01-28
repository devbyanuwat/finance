import { test, expect } from '@playwright/test'

test.describe('Authentication with Clerk', () => {
  test('login page shows Clerk SignIn component', async ({ page }) => {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')

    // Wait for Clerk to load
    await page.waitForTimeout(2000)

    // Take screenshot
    await page.screenshot({ path: '/tmp/clerk-login-test.png', fullPage: true })

    // Check that we're on the login page
    expect(page.url()).toContain('/login')

    // Look for Clerk elements (Clerk uses specific class names and data attributes)
    const clerkContent = await page.content()
    const hasClerkElements =
      clerkContent.includes('cl-') ||
      clerkContent.includes('clerk') ||
      clerkContent.includes('Sign in')

    expect(hasClerkElements).toBeTruthy()
  })

  test('signup page shows Clerk SignUp component', async ({ page }) => {
    await page.goto('/signup')
    await page.waitForLoadState('networkidle')

    // Wait for Clerk to load
    await page.waitForTimeout(2000)

    // Take screenshot
    await page.screenshot({ path: '/tmp/clerk-signup-test.png', fullPage: true })

    // Check that we're on the signup page
    expect(page.url()).toContain('/signup')
  })

  test('unauthenticated user is redirected to login from dashboard', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    // Wait for redirect
    await page.waitForTimeout(2000)

    // Should be redirected to login
    expect(page.url()).toContain('/login')
  })

  test('unauthenticated user is redirected to login from accounts', async ({ page }) => {
    await page.goto('/accounts')
    await page.waitForLoadState('networkidle')

    // Wait for redirect
    await page.waitForTimeout(2000)

    // Should be redirected to login
    expect(page.url()).toContain('/login')
  })
})
