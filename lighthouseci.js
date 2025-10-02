module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:3000/', 'http://localhost:3000/certificates', 'http://localhost:3000/signoff'],
      settings: {
        chromeFlags: '--no-sandbox'
      }
    },
    assert: {
      assertions: {
        'categories:performance': 'warn',
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': 'warn',
        'categories:seo': 'warn'
      }
    },
    upload: {
      target: 'temporary-public-storage'
    }
  }
}
