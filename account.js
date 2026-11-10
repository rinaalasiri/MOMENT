function auth(signup, params) {
  const suffix = params.get('next') ? '?next=' + encodeURIComponent(params.get('next')) : '';
  return (
    '<div class="wrap account">' +
    intro(
      'YOUR MOMENT',
      signup ? 'Create an account' : 'Welcome back',
      'Demo accounts are saved in this browser. Use sample information.',
    ) +
    '<form class="panel form" id="' +
    (signup ? 'signup' : 'signin') +
    '">' +
    (signup
      ? field('Full name', 'name', 'text', '', 'required autocomplete="name" maxlength="100"')
      : '') +
    field('Email address', 'email', 'email', '', 'required autocomplete="email"') +
    field(
      'Password',
      'password',
      'password',
      '',
      signup
        ? 'required minlength="8" autocomplete="new-password"'
        : 'required autocomplete="current-password"',
    ) +
    '<p id="error" role="alert"></p><button>' +
    (signup ? 'Create account' : 'Sign in') +
    '</button><a href="#/' +
    (signup ? 'sign-in' : 'sign-up') +
    suffix +
    '">' +
    (signup ? 'Already registered? Sign in' : 'New to MOMENT? Create an account') +
    '</a></form></div>'
  );
}
function profile(user) {
  if (!user)
    return (
      '<div class="wrap">' +
      empty(
        'Sign in to view your profile',
        'Manage your demo account details.',
        '/sign-in?next=%2Fprofile',
        'Sign in',
      ) +
      '</div>'
    );
  return (
    '<div class="wrap account">' +
    intro('YOUR ACCOUNT', 'Profile', 'Manage your contact information.') +
    '<form id="profile" class="panel form">' +
    field('Full name', 'name', 'text', user.name, 'required maxlength="100"') +
    field('Email address', 'email', 'email', user.email, 'required') +
    field('Saudi mobile number', 'phone', 'tel', user.phone, 'placeholder="+9665XXXXXXXX"') +
    ('<p id="error" role="alert"></p><p id="feedback" role="status"></p><button>Save' +
      ' profile</button></form></div>')
  );
}
