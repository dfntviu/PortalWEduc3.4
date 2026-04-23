<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useAuthStore3 } from '@/stores/authStore3';

const router = useRouter();
const authStore3 = useAuthStore3();

if (authStore3.isAuthenticated) {
  router.replace(
    authStore3.role === 'teacher'
      ? { name: 'viewBienvenidaStudents' }
      : { name: 'viewWelcomeTeachers' }
  );
} else {
  router.replace({ name: 'viewLoginMultUser' });
}
</script>