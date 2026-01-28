from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()

    # Navigate to login page
    page.goto('http://localhost:5173/login')

    # Wait for page to fully load (Clerk components are JS-based)
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(2000)  # Extra wait for Clerk to render

    # Take screenshot
    page.screenshot(path='/tmp/clerk-login.png', full_page=True)
    print("Screenshot saved to /tmp/clerk-login.png")

    # Get page content for inspection
    content = page.content()

    # Check if Clerk elements are present
    if 'clerk' in content.lower() or 'sign' in content.lower():
        print("Clerk login page loaded successfully!")
    else:
        print("Warning: Clerk elements may not have loaded")

    # Find any buttons on the page
    buttons = page.locator('button').all()
    print(f"Found {len(buttons)} buttons on the page")

    browser.close()
