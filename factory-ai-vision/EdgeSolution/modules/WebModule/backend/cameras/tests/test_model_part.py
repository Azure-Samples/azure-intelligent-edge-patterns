from django.test import TransactionTestCase
from cameras.models import Part
from django.db.utils import IntegrityError
from sqlite3 import IntegrityError as dbIntegrityError


class ModelPartTestCase(TransactionTestCase):
    def setUp(self):
        """
        Create serveral Part
        :DEFAULT_TRAINER: trainer create from configs
        :INVALID_TRAINER: an invalid trainer
        """
        for partname in ['Box', 'barrel', 'hAMMER', 'ScReWdRiVeR', 'BOTTLE', 'PLASTIC BAG']:
            demo_part, created = Part.objects.update_or_create(
                name=partname,
                is_demo=True,
                defaults={
                    'description': "Demo Test case"
                }
            )

        for partname in ['Box', 'Barrel', 'Hammer', 'Screwdriver', 'Bottle', 'Plastic bag']:
            demo_part, created = Part.objects.update_or_create(
                name=partname,
                is_demo=False,
                defaults={
                    'description': "None Demo Test case"
                }
            )

    def test_create_ok_if_unique(self):
        """
        part should be unique with (is_demo, name_lower)
        name_lower is auto generated in pre_save
        should pass
        """
        new_part, created = Part.objects.update_or_create(
            name="NewPart", is_demo=True)
        self.assertTrue(created)
        # Same name in demo set
        # Should pass, so any downloading task with part with name already in demo set will not failed
        new_part, created = Part.objects.update_or_create(
            name="NewPart", is_demo=False)
        self.assertTrue(created)

    def test_create_failed_if_not_unique(self):
        """
        revalidate should update 
        """
        # Same name in demo set
        for partname in ['Box', 'barrel', 'hAMMER', 'ScReWdRiVeR', 'BOTTLE', 'PLASTIC BAG']:
            try:
                test_part = Part.objects.create(
                    name=partname,
                    is_demo=True,
                    description='Test Description'
                )
                self.fail("Should not created")
            except IntegrityError:
                pass
            except:
                self.fail("Unexpected Error")
        # Same name in pratical set
        for partname in ['Box', 'barrel', 'hAMMER', 'ScReWdRiVeR', 'BOTTLE', 'PLASTIC BAG']:
            try:
                test_part = Part.objects.create(
                    name=partname,
                    is_demo=False,
                    description='Test Description'
                )
                self.fail("Should not created")
            except IntegrityError:
                pass
            except:
                self.fail("Unexpected Error")
