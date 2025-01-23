<script setup lang="ts">
const route = useRoute()

onMounted(async () => {
  const code = route.query.code as string

  if (code) {
    try {
      const hostname = window.location.hostname
      const response = await fetch(`http://${hostname}:5099/api/auth/github/callback?code=${code}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      const responseData = await response.json();
      const userInfo = responseData.data.data;
      
      if (userInfo) {
        localStorage.setItem('jwt', userInfo.jwt);
        localStorage.setItem('username', userInfo.username);
        localStorage.setItem('avatarUrl', userInfo.photos[0].value);

        // const queryParams = new URLSearchParams({
        //   username: userInfo.username,
        // });
        // window.location.href = `/claim?${queryParams.toString()}`;
        window.location.href = '/claim';
      } else {
        throw new Error('Failed to get user info');
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
      window.location.href = '/claim';
    }
  } else {
    window.location.href = '/claim';
  }
})
</script>

<template>
  <div class="flex items-center justify-center min-h-screen">
    <p>Redirecting...</p>
  </div>
</template>
